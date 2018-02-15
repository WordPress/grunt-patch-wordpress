'use strict';

var grunt = require( 'grunt' )
	, patch = require( '../lib/patch.js' )
    , url = require( 'url' )
	, expect = require( 'chai' ).expect
	, trac = require( '../lib/trac.js' )
	, map_old_to_new_file_path = require( '../lib/map_old_to_new_file_path.js' );

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

	describe( 'map_old_to_new_file_path', function() {
		var file_mappings = {
			'src/wp-admin/js/color-picker.js': 'src/js/_enqueues/lib/color-picker.js'
		};

		it ( 'replaces old file paths with new file paths in the diff', function() {
			grunt.file.copy( "./test/fixtures/patch_wordpress_1.diff", "./test/fixtures/patch_wordpress_1_copy.diff" );
			map_old_to_new_file_path( "./test/fixtures/patch_wordpress_1_copy.diff", file_mappings );

			var expected = grunt.file.read( "./test/expected/patch_wordpress_1.diff" );
			var actual = grunt.file.read( "./test/fixtures/patch_wordpress_1_copy.diff" );

			expect( actual ).to.equal( expected );

			grunt.file.delete( "./test/fixtures/patch_wordpress_1_copy.diff" );
		});

		it ( 'doesn\'t replace new file paths', function() {
			grunt.file.copy( "./test/fixtures/patch_wordpress_2.diff", "./test/fixtures/patch_wordpress_2_copy.diff" );
			map_old_to_new_file_path( "./test/fixtures/patch_wordpress_2_copy.diff", file_mappings );

			var expected = grunt.file.read( "./test/expected/patch_wordpress_2.diff" );
			var actual = grunt.file.read( "./test/fixtures/patch_wordpress_2_copy.diff" );

			expect( actual ).to.equal( expected );

			grunt.file.delete( "./test/fixtures/patch_wordpress_2_copy.diff" );
		});

		it ( 'doesn\'t replace file paths that are not in the file mappings object', function() {
			grunt.file.copy( "./test/fixtures/patch_wordpress_3.diff", "./test/fixtures/patch_wordpress_3_copy.diff" );
			map_old_to_new_file_path( "./test/fixtures/patch_wordpress_3_copy.diff", file_mappings );

			var expected = grunt.file.read( "./test/expected/patch_wordpress_3.diff" );
			var actual = grunt.file.read( "./test/fixtures/patch_wordpress_3_copy.diff" );

			expect( actual ).to.equal( expected );

			grunt.file.delete( "./test/fixtures/patch_wordpress_3_copy.diff" );
		});

		it ( 'replaces old file paths with new file paths but doesn\'t replace file paths that are not ' +
			'in the file mappings object in a diff file with multiple diffs', function() {
			grunt.file.copy( "./test/fixtures/patch_wordpress_4.diff", "./test/fixtures/patch_wordpress_4_copy.diff" );
			map_old_to_new_file_path( "./test/fixtures/patch_wordpress_4_copy.diff", file_mappings );

			var expected = grunt.file.read( "./test/expected/patch_wordpress_4.diff" );
			var actual = grunt.file.read( "./test/fixtures/patch_wordpress_4_copy.diff" );

			expect( actual ).to.equal( expected );

			grunt.file.delete( "./test/fixtures/patch_wordpress_4_copy.diff" );
		});

		it ( 'doesn\'t replaces new file paths and file paths that are not in the file mappings object in a diff file' +
			' with multiple diffs', function() {
			grunt.file.copy( "./test/fixtures/patch_wordpress_5.diff", "./test/fixtures/patch_wordpress_5_copy.diff" );
			map_old_to_new_file_path( "./test/fixtures/patch_wordpress_5_copy.diff", file_mappings );

			var expected = grunt.file.read( "./test/expected/patch_wordpress_5.diff" );
			var actual = grunt.file.read( "./test/fixtures/patch_wordpress_5_copy.diff" );

			expect( actual ).to.equal( expected );

			grunt.file.delete( "./test/fixtures/patch_wordpress_5_copy.diff" );
		});

		it ( 'only replaces old file paths in a diff file with multiple diffs', function() {
			grunt.file.copy( "./test/fixtures/patch_wordpress_6.diff", "./test/fixtures/patch_wordpress_6_copy.diff" );
			map_old_to_new_file_path( "./test/fixtures/patch_wordpress_6_copy.diff", file_mappings );

			var expected = grunt.file.read( "./test/expected/patch_wordpress_6.diff" );
			var actual = grunt.file.read( "./test/fixtures/patch_wordpress_6_copy.diff" );

			expect( actual ).to.equal( expected );

			grunt.file.delete( "./test/fixtures/patch_wordpress_6_copy.diff" );
		});
	});
})
