var grunt = require( 'grunt' )
	, expect = require( 'chai' ).expect
	, patch = require( '../lib/patch.js' )
	, coreGit = grunt.file.read ( 'test/fixtures/core.git.diff' )
	, coreSvn = grunt.file.read ( 'test/fixtures/core.svn.diff' )
	, developGit = grunt.file.read ( 'test/fixtures/develop.git.diff' )
	, developSvn = grunt.file.read ( 'test/fixtures/develop.svn.diff' )
	, coreIndexGit = grunt.file.read ( 'test/fixtures/core.git.index.diff' )
	, coreIndexSvn = grunt.file.read ( 'test/fixtures/core.svn.index.diff' )
	, developIndexGit = grunt.file.read ( 'test/fixtures/develop.git.index.diff' )
	, developIndexSvn = grunt.file.read ( 'test/fixtures/develop.svn.index.diff' )
	, developSampleGit = grunt.file.read ( 'test/fixtures/develop.git.wp-config-sample.diff' )
	, developSampleSvn = grunt.file.read ( 'test/fixtures/develop.svn.wp-config-sample.diff' )
	, testsSvn = grunt.file.read ( 'test/fixtures/tests.develop.svn.diff' )
	, testsGit = grunt.file.read ( 'test/fixtures/tests.develop.git.diff' )
	, abyes = grunt.file.read( 'test/fixtures/git.diff.ab.diff' )

describe( 'Patch helpers', function() {

	it( 'git a/b diffs should not automatticaly trigger moving to src', function( done ){
		expect( patch.move_to_src( abyes ) ).to.not.be.true

		done()
	})

	it( 'tests diffs should always be applied in the root of the checkout', function(done){

		expect( patch.move_to_src( testsGit ) ).to.not.be.true
		expect( patch.move_to_src( testsSvn ) ).to.not.be.true

		done()
	})

	it( 'dev.git diffs should always be applied in the root of the checkout', function(done){

		expect( patch.move_to_src( developGit ) ).to.not.be.true
		expect( patch.move_to_src( developIndexGit ) ).to.not.be.true

		done()
	})

	it( 'dev.svn diffs should always be applied in the root of the checkout', function(done){

		expect( patch.move_to_src( developSvn ) ).to.not.be.true
		expect( patch.move_to_src( developIndexSvn ) ).to.not.be.true

		done()
	})

	it( 'core.git.wordpress.org diffs should always be applied in the svn folder', function(done){

		expect( patch.move_to_src( coreGit ) ).to.be.true

		done()
	})

	it( 'core.svn.wordpress.org diffs should always be applied in the svn folder', function(done){

		expect( patch.move_to_src( coreSvn ) ).to.be.true

		done()
	})

	it( 'index.php should always be applied in the src folder', function(done){

		expect( patch.move_to_src( coreIndexSvn ) ).to.be.true
		expect( patch.move_to_src( coreIndexGit ) ).to.be.true

		done()

	})

	it( 'wp-config-sample.php should always be applied in the root folder', function(done){
		expect( patch.move_to_src( developSampleSvn ) ).to.not.be.true
		expect( patch.move_to_src( developSampleGit ) ).to.not.be.true

		done()

	})

	it ( 'is_ab should return true on patches with a/ b/ style', function(done){

		expect( patch.is_ab( abyes ) ).to.be.true

		done()
	})

	it ( 'is_ab should return false on patches without a/ b/ style', function(done){

		expect( patch.is_ab( developSampleGit ) ).to.not.be.true
		expect( patch.is_ab( developSampleSvn ) ).to.not.be.true
		expect( patch.is_ab( coreIndexGit ) ).to.not.be.true
		expect( patch.is_ab( coreIndexSvn ) ).to.not.be.true
		expect( patch.is_ab( coreGit ) ).to.not.be.true
		expect( patch.is_ab( coreSvn ) ).to.not.be.true
		expect( patch.is_ab( developGit ) ).to.not.be.true
		expect( patch.is_ab( developSvn ) ).to.not.be.true
		expect( patch.is_ab( developIndexGit ) ).to.not.be.true
		expect( patch.is_ab( developIndexSvn ) ).to.not.be.true
		expect( patch.is_ab( testsGit ) ).to.not.be.true
		expect( patch.is_ab( testsSvn ) ).to.not.be.true

		done()
	})

})
