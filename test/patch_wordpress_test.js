'use strict';

var grunt = require( 'grunt' )
	, patch = require( '../lib/patch.js' )
    , url = require( 'url' )
	, expect = require( 'chai' ).expect
	, trac = require( '../lib/trac.js' )

describe('grunt_patch_wordpress', function () {
	describe('sanity checks', function () {
		it('a is a', function(done){
			expect('a').to.equal('a')
			done()
		})

	})

	it( 'convert_to_raw converts urls', function(done){
		expect( trac.convert_to_raw ( url.parse( 'https://core.trac.wordpress.org/attachment/ticket/26700/26700.diff'  ) ) ).to.equal( 'https://core.trac.wordpress.org/raw-attachment/ticket/26700/26700.diff' )
		done()
	})

	describe( 'Level Calculator' , function() {
		// @TODO: Find alot of patches to use here

		it ( '26602.2.diff is 0', function(done) {
			var file = grunt.file.read( 'test/fixtures/26602.2.diff')
			expect( patch.level_calculator( file ) ).to.equal( 0 )
			done()
		})
	})
})
