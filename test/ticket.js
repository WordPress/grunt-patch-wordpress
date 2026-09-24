const grunt = require( 'grunt' );
const { ticketUrl, formatTicket } = require( '../lib/ticket-format.js' );
const { isChallenge } = require( '../lib/trac-browser.js' );

describe( 'ticket task helpers', () => {
	describe( 'ticketUrl', () => {
		it.each( [
			[ '66079', 'https://core.trac.wordpress.org/ticket/66079' ],
			[ ' 66079 ', 'https://core.trac.wordpress.org/ticket/66079' ],
			[
				'https://core.trac.wordpress.org/ticket/66079',
				'https://core.trac.wordpress.org/ticket/66079',
			],
			[
				'https://core.trac.wordpress.org/ticket/66079#comment:3',
				'https://core.trac.wordpress.org/ticket/66079',
			],
			[
				'https://meta.trac.wordpress.org/ticket/8202',
				'https://meta.trac.wordpress.org/ticket/8202',
			],
		] )( 'resolves %s', ( input, expected ) => {
			expect( ticketUrl( input, 'core.trac.wordpress.org' ) ).toBe(
				expected
			);
		} );

		it( 'uses the configured host for bare numbers', () => {
			expect( ticketUrl( '12', 'meta.trac.wordpress.org' ) ).toBe(
				'https://meta.trac.wordpress.org/ticket/12'
			);
		} );

		it.each( [ [ '' ], [ undefined ], [ 'abc' ] ] )(
			'returns null for %s',
			( input ) => {
				expect(
					ticketUrl( input, 'core.trac.wordpress.org' )
				).toBeNull();
			}
		);
	} );

	it( 'formatTicket renders the expected text', () => {
		const ticket = JSON.parse(
			grunt.file.read( 'test/fixtures/ticket-66079.json' )
		);
		const expected = grunt.file
			.read( 'test/expected/ticket-66079.txt' )
			.trimEnd();

		expect( formatTicket( ticket ) ).toBe( expected );
	} );

	it( 'formatTicket copes with an empty ticket', () => {
		const text = formatTicket( {
			id: '#1',
			summary: 'Nothing here',
			status: 'new',
			type: 'defect',
			resolution: '',
			properties: {},
			description: '',
			attachments: [],
			pullRequests: [],
			comments: [],
			url: 'https://core.trac.wordpress.org/ticket/1',
		} );

		expect( text ).toContain( '#1 Nothing here' );
		expect( text ).toContain( '(none)' );
		expect( text ).toContain( '== Change History (0) ==' );
		expect( text ).not.toContain( '== Attachments ==' );
	} );

	it( 'isChallenge recognises the Trac interstitial', () => {
		expect(
			isChallenge(
				'<!DOCTYPE html><title>Checking your browser...</title><noscript><p>Javascript required</p></noscript>'
			)
		).toBe( true );
		expect(
			isChallenge( '<html><body>Index: file.php</body></html>' )
		).toBe( false );
		expect( isChallenge( undefined ) ).toBe( false );
	} );
} );
