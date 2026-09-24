/*
 * Turn the object returned by trac-browser.readTicket() into readable text.
 */

/**
 * Build the ticket URL for a task argument.
 *
 * Accepts a bare ticket number, a ticket URL on any host, or a URL with a
 * fragment such as `#comment:3`.
 *
 * @param {string} input   Task argument.
 * @param {string} tracUrl Default Trac hostname.
 * @return {string|null} Ticket URL, or null when no ticket number was found.
 */
function ticketUrl( input, tracUrl ) {
	const value = String( input || '' ).trim();
	const idMatch = value.match( /(\d+)\s*(?:[#?].*)?$/ );

	if ( ! idMatch ) {
		return null;
	}

	let host = tracUrl;
	if ( /^https?:\/\//.test( value ) ) {
		host = new URL( value ).host;
	}

	return 'https://' + host + '/ticket/' + idMatch[ 1 ];
}

/**
 * Format a ticket as plain text.
 *
 * @param {Object} ticket Ticket data from trac-browser.readTicket().
 * @return {string} Text.
 */
function formatTicket( ticket ) {
	const lines = [];

	lines.push( ( ticket.id + ' ' + ticket.summary ).trim() );
	lines.push(
		[ ticket.status, ticket.type, ticket.resolution ]
			.filter( Boolean )
			.join( ' ' ) +
			'  ' +
			ticket.url
	);
	lines.push( '' );

	Object.keys( ticket.properties || {} ).forEach( ( key ) => {
		lines.push( key.padEnd( 12 ) + ' ' + ticket.properties[ key ] );
	} );

	lines.push( '', '== Description ==', '', ticket.description || '(none)' );

	if ( ticket.attachments && ticket.attachments.length ) {
		lines.push( '', '== Attachments ==', '' );
		ticket.attachments.forEach( ( attachment ) => {
			lines.push( '- ' + attachment.name + ' ' + attachment.meta );
			if ( attachment.description ) {
				lines.push( '    ' + attachment.description );
			}
			lines.push( '    ' + attachment.rawUrl );
		} );
	}

	if ( ticket.pullRequests && ticket.pullRequests.length ) {
		lines.push( '', '== Pull Requests ==', '' );
		ticket.pullRequests.forEach( ( pullRequest ) => {
			lines.push( '- ' + pullRequest );
		} );
	}

	const comments = ticket.comments || [];
	lines.push( '', '== Change History (' + comments.length + ') ==' );
	comments.forEach( ( comment ) => {
		lines.push(
			'',
			(
				'--- ' +
				( comment.id || '(change)' ) +
				' ' +
				comment.author +
				' ' +
				comment.when
			).trim()
		);
		comment.changes.forEach( ( change ) => {
			lines.push( '  * ' + change );
		} );
		if ( comment.text ) {
			lines.push( '', comment.text );
		}
	} );

	return lines.join( '\n' );
}

module.exports = {
	ticketUrl,
	formatTicket,
};
