var grunt = require( 'grunt' )
	, expect = require( 'chai' ).expect
	, regex = require( '../lib/regex.js' )
	, html23988 = grunt.file.read ( 'test/fixtures/23988.html' )
	, html23989 = grunt.file.read ( 'test/fixtures/23989.html' )
	, html23994 = grunt.file.read ( 'test/fixtures/23994.html' )

describe( 'regular expressions', function() {
	it('multiple patches on a ticket with non patches as well', function(done){
		var matches = regex.patch_attachments( html23988 )
			, long_matches = regex.long_matches( html23988 )
			, possible_patches = regex.possible_patches( long_matches )

		expect( matches ).to.have.length( 2 )
		expect( long_matches ).to.have.length( 4 )
		expect( possible_patches ).to.have.length( 2 )

		done()
	})

	it('one patch on a ticket', function(done){
		var matches = regex.patch_attachments( html23994 )

		expect( matches ).to.have.length( 1 )
		done()
	})

	it('url from a list of attachments', function(done){
		var matches = regex.patch_attachments( html23994 )
			url = 'core.trac.wordpress.org' + regex.urls_from_attachment_list(   matches[0] )[1]

		expect( url ).to.be.equal( 'core.trac.wordpress.org/attachment/ticket/23994/23994.diff' )
		done()
	})

	it('no patches on a ticket', function(done){
		var matches = regex.patch_attachments( html23989 )

		expect( matches ).to.be.null
		done()
	})

	it('filenames should be cleaned', function(done) {
		var filename = "?       one.diff"

		expect( regex.local_file_clean( filename ) ).to.equal( "one.diff" )
		done()
	})
})
