var grunt = require( 'grunt' ),
	regex = require( '../lib/regex.js' ),
	html23988 = grunt.file.read ( 'test/fixtures/23988.html' ),
	html23989 = grunt.file.read ( 'test/fixtures/23989.html' ),
	html23994 = grunt.file.read ( 'test/fixtures/23994.html' );

describe( 'regular expressions', function() {
	it( 'multiple patches on a ticket with non patches as well', function( done ) {
		var matches = regex.patchAttachments( html23988 ),
			longMatches = regex.longMatches( html23988 ),
			possiblePatches = regex.possiblePatches( longMatches );

		expect( matches.length ).toBe( 2 );
		expect( longMatches.length ).toBe( 4 );
		expect( possiblePatches.length ).toBe( 2 );

		done();
	});

	it( 'one patch on a ticket', function( done ) {
		var matches = regex.patchAttachments( html23994 );

		expect( matches.length ).toBe( 1 );
		done();
	});

	it( 'url from a list of attachments', function( done ) {
		var matches = regex.patchAttachments( html23994 );
		url = 'core.trac.wordpress.org' + regex.urlsFromAttachmentList(   matches[0])[1];

		expect( url ).toBe( 'core.trac.wordpress.org/attachment/ticket/23994/23994.diff' );
		done();
	});

	it( 'no patches on a ticket', function( done ) {
		var matches = regex.patchAttachments( html23989 );

		expect( matches ).toBeNull();
		done();
	});

	it( 'filenames should be cleaned', function( done ) {
		var filename = '?       one.diff';

		expect( regex.localFileClean( filename ) ).toEqual( 'one.diff' );
		done();
	});
});
