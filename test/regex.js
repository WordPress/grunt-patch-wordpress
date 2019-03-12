var grunt = require( 'grunt' ),
	regex = require( '../lib/regex.js' ),
	html23988 = grunt.file.read ( 'test/fixtures/23988.html' ),
	html23989 = grunt.file.read ( 'test/fixtures/23989.html' ),
	html23994 = grunt.file.read ( 'test/fixtures/23994.html' );

describe( 'regular expressions', function() {
	it( 'multiple patches on a ticket with non patches as well', function() {
		var matches = regex.patchAttachments( html23988 ),
			longMatches = regex.longMatches( html23988 ),
			possiblePatches = regex.possiblePatches( longMatches );

		expect( matches.length ).toBe( 2 );
		expect( longMatches.length ).toBe( 4 );
		expect( possiblePatches.length ).toBe( 2 );
	});

	it( 'one patch on a ticket', function() {
		var matches = regex.patchAttachments( html23994 );

		expect( matches.length ).toBe( 1 );
	});

	it( 'url from a list of attachments', function() {
		var matches = regex.patchAttachments( html23994 );
		url = 'core.trac.wordpress.org' + regex.urlsFromAttachmentList(   matches[0])[1];

		expect( url ).toBe( 'core.trac.wordpress.org/attachment/ticket/23994/23994.diff' );
	});

	it( 'no patches on a ticket', function() {
		var matches = regex.patchAttachments( html23989 );

		expect( matches ).toBeNull();
	});

	it( 'filenames should be cleaned', function() {
		var filename = '?       one.diff';

		expect( regex.localFileClean( filename ) ).toEqual( 'one.diff' );
	});
});
