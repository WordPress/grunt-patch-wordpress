/*
 * Fetch pages and attachments from Trac through a real browser.
 *
 * Trac instances on WordPress.org answer non-browser clients with a JavaScript
 * proof-of-work challenge ("Checking your browser...", HTTP 403). The challenge
 * is designed to let browsers through, so this module drives a headless Chromium
 * via Playwright to pass it once, then reuses that session's cookies for plain
 * requests. Playwright is an optional peer dependency and is loaded lazily so the
 * package still installs and runs its other tasks without it.
 */

const os = require( 'os' );
const path = require( 'path' );

const CHALLENGE_MARKER = 'Checking your browser';
const CHALLENGE_TIMEOUT = 60000;

let context = null;
let page = null;
const primedHosts = new Set();

/**
 * Whether a response body is the Trac bot-protection challenge page.
 *
 * @param {string} body Response body.
 * @return {boolean} True when the body is the challenge interstitial.
 */
function isChallenge( body ) {
	return 'string' === typeof body && body.includes( CHALLENGE_MARKER );
}

/**
 * Error raised when Trac keeps answering with the challenge page.
 *
 * @param {string} url URL that was requested.
 * @return {Error} Error with a `code` of `TRAC_CHALLENGE`.
 */
function challengeError( url ) {
	const error = new Error(
		'Trac returned a bot-protection challenge (403) for ' +
			url +
			' and it could not be passed. Try again in a moment.'
	);
	error.code = 'TRAC_CHALLENGE';
	return error;
}

/**
 * Load Playwright, or explain how to get it.
 *
 * @return {Object} The `playwright` module.
 */
function loadPlaywright() {
	try {
		return require( 'playwright' );
	} catch {
		const error = new Error(
			'Reading from Trac requires Playwright, which is not installed. ' +
				'Run: npm install playwright && npx playwright install chromium'
		);
		error.code = 'PLAYWRIGHT_MISSING';
		throw error;
	}
}

/**
 * Directory where the browser profile (and so the challenge cookie) is kept.
 *
 * @return {string} Absolute path.
 */
function profileDir() {
	return path.join( os.homedir(), '.cache', 'grunt-patch-wordpress' );
}

/**
 * Launch the browser once and return a page in a persistent context.
 *
 * @return {Promise<Object>} Playwright page.
 */
async function getPage() {
	if ( page ) {
		return page;
	}

	const { chromium } = loadPlaywright();

	try {
		context = await chromium.launchPersistentContext( profileDir(), {
			headless: true,
		} );
	} catch ( launchError ) {
		if ( /Executable doesn't exist/.test( launchError.message ) ) {
			const error = new Error(
				'Reading from Trac requires a Chromium build for Playwright. ' +
					'Run: npx playwright install chromium'
			);
			error.code = 'BROWSER_MISSING';
			throw error;
		}
		throw launchError;
	}

	page = context.pages()[ 0 ] || ( await context.newPage() );
	return page;
}

/**
 * Visit a page in the browser and wait until the challenge has been passed.
 *
 * @param {string} url             URL to open.
 * @param {string} [readySelector] Selector that marks the real page as rendered.
 * @return {Promise<Object>} The page, positioned on `url`.
 */
async function open( url, readySelector ) {
	const browserPage = await getPage();

	await browserPage.goto( url, { waitUntil: 'domcontentloaded' } );

	try {
		if ( readySelector ) {
			await browserPage.waitForSelector( readySelector, {
				timeout: CHALLENGE_TIMEOUT,
			} );
		} else {
			await browserPage.waitForFunction(
				( marker ) => ! document.title.includes( marker ),
				CHALLENGE_MARKER,
				{ timeout: CHALLENGE_TIMEOUT }
			);
		}
	} catch {
		throw challengeError( url );
	}

	primedHosts.add( new URL( url ).host );
	return browserPage;
}

/**
 * Make sure the browser session holds a valid challenge cookie for a host.
 *
 * @param {string} host Trac hostname.
 * @return {Promise<void>}
 */
async function prime( host ) {
	if ( primedHosts.has( host ) ) {
		return;
	}
	await open( 'https://' + host + '/' );
}

/**
 * Fetch a URL with the browser session's cookies.
 *
 * @param {string} url URL to fetch.
 * @return {Promise<{status: number, body: string}>} Status and body text.
 */
async function fetch( url ) {
	const host = new URL( url ).host;
	await prime( host );

	const browserPage = await getPage();
	let response = await browserPage.request.get( url );
	let body = await response.text();

	// The cookie may have expired; pass the challenge once more and retry.
	if ( 403 === response.status() && isChallenge( body ) ) {
		primedHosts.delete( host );
		await prime( host );
		response = await browserPage.request.get( url );
		body = await response.text();

		if ( 403 === response.status() && isChallenge( body ) ) {
			throw challengeError( url );
		}
	}

	return { status: response.status(), body };
}

/**
 * Read a rendered Trac ticket into a plain object.
 *
 * @param {string} url Ticket URL.
 * @return {Promise<Object>} Ticket data.
 */
async function readTicket( url ) {
	const browserPage = await open( url, '#ticket' );

	return browserPage.evaluate( () => {
		const text = ( el ) =>
			el
				? el.innerText
						.replace( new RegExp( '\\u200b', 'g' ), '' )
						.replace( /\s+\n/g, '\n' )
						.trim()
				: '';
		const q = ( sel, root = document ) => root.querySelector( sel );
		const qa = ( sel, root = document ) =>
			Array.from( root.querySelectorAll( sel ) );

		const ticket = q( '#ticket' );

		const properties = {};
		qa( 'table.properties th', ticket ).forEach( ( th ) => {
			const key = th.textContent.replace( /:\s*$/, '' ).trim();
			const td = th.nextElementSibling;
			if ( key && td ) {
				properties[ key ] = text( td );
			}
		} );

		const attachments = qa( '#attachments dl.attachments dt' ).map(
			( dt ) => {
				const link = q( 'a', dt );
				const name = link ? link.textContent.trim() : text( dt );
				const dd =
					dt.nextElementSibling &&
					'DD' === dt.nextElementSibling.tagName
						? dt.nextElementSibling
						: null;
				return {
					name,
					url: link
						? new URL(
								link.getAttribute( 'href' ),
								document.location.href
						  ).href
						: '',
					rawUrl: link
						? new URL(
								link.getAttribute( 'href' ),
								document.location.href
						  ).href.replace( '/attachment/', '/raw-attachment/' )
						: '',
					meta: text( dt ).replace( name, '' ).trim(),
					description: text( dd ),
				};
			}
		);

		const pullRequests = qa( 'a[href*="github.com/"][href*="/pull/"]' )
			.map( ( a ) => a.href.split( '#' )[ 0 ] )
			.filter( ( href, i, all ) => all.indexOf( href ) === i );

		const comments = qa( '#changelog div.change' ).map( ( change ) => {
			const heading = q( 'h3.change', change );
			const isBot = heading && heading.classList.contains( 'chat-bot' );
			const usernameLinks = heading
				? qa( '.username-line a', heading )
				: [];
			const idMatch = text( heading ).match( /comment:(\d+)/ );
			const numberLink = q( '.threading a[href^="#comment"]', change );
			let id = '';
			if ( numberLink ) {
				id = numberLink.textContent.trim();
			} else if ( idMatch ) {
				id = '#' + idMatch[ 1 ];
			}

			return {
				id,
				author:
					text(
						q(
							'.trac-author, .trac-author-user, .trac-author-anonymous',
							heading
						)
					) ||
					( isBot && usernameLinks.length
						? text( usernameLinks[ usernameLinks.length - 1 ] )
						: '' ) ||
					( isBot ? '(bot)' : '' ),
				when: (
					( q( 'a.timeline', heading ) || {} ).title ||
					text( q( 'a.timeline', heading ) )
				).replace( /^See timeline at\s*/, '' ),
				changes: qa( 'ul.changes li', change ).map( text ),
				text: text( q( 'div.comment', change ) ),
			};
		} );

		const titleMatch = document.title.match( /^#\d+\s+\((.*)\)\s+–/ );

		return {
			id: text( q( 'a.trac-id', ticket ) ),
			summary: titleMatch ? titleMatch[ 1 ] : text( q( 'h1', ticket ) ),
			status: text( q( 'span.trac-status', ticket ) ),
			type: text( q( 'span.trac-type', ticket ) ),
			resolution: text( q( 'span.trac-resolution', ticket ) ),
			properties,
			description: text( q( '.description .searchable', ticket ) ),
			attachments,
			pullRequests,
			comments,
			url: document.location.href.split( '#' )[ 0 ],
		};
	} );
}

/**
 * Close the browser, if one was launched.
 *
 * @return {Promise<void>}
 */
async function close() {
	if ( context ) {
		await context.close();
	}
	context = null;
	page = null;
	primedHosts.clear();
}

module.exports = {
	isChallenge,
	fetch,
	open,
	readTicket,
	close,
};
