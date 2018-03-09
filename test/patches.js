var grunt = require( 'grunt' ),
	expect = require( 'chai' ).expect,
	patch = require( '../lib/patch.js' ),
	coreGit = grunt.file.read ( 'test/fixtures/core.git.diff' ),
	coreSvn = grunt.file.read ( 'test/fixtures/core.svn.diff' ),
	developGit = grunt.file.read ( 'test/fixtures/develop.git.diff' ),
	developSvn = grunt.file.read ( 'test/fixtures/develop.svn.diff' ),
	coreIndexGit = grunt.file.read ( 'test/fixtures/core.git.index.diff' ),
	coreIndexSvn = grunt.file.read ( 'test/fixtures/core.svn.index.diff' ),
	developIndexGit = grunt.file.read ( 'test/fixtures/develop.git.index.diff' ),
	developIndexSvn = grunt.file.read ( 'test/fixtures/develop.svn.index.diff' ),
	developSampleGit = grunt.file.read ( 'test/fixtures/develop.git.wp-config-sample.diff' ),
	developSampleSvn = grunt.file.read ( 'test/fixtures/develop.svn.wp-config-sample.diff' ),
	testsSvn = grunt.file.read ( 'test/fixtures/tests.develop.svn.diff' ),
	testsGit = grunt.file.read ( 'test/fixtures/tests.develop.git.diff' ),
	abyes = grunt.file.read( 'test/fixtures/git.diff.ab.diff' ),
	coreTrunkSvn = grunt.file.read ( 'test/fixtures/core.svn.trunk.diff' );

describe( 'Patch helpers', function() {

	it( 'git a/b diffs should not automatticaly trigger moving to src', function( done ) {
		expect( patch.moveToSrc( abyes ) ).to.not.be.true;

		done();
	});

	it( 'tests diffs should always be applied in the root of the checkout', function( done ) {

		expect( patch.moveToSrc( testsGit ) ).to.not.be.true;
		expect( patch.moveToSrc( testsSvn ) ).to.not.be.true;

		done();
	});

	it( 'dev.git diffs should always be applied in the root of the checkout', function( done ) {

		expect( patch.moveToSrc( developGit ) ).to.not.be.true;
		expect( patch.moveToSrc( developIndexGit ) ).to.not.be.true;

		done();
	});

	it( 'dev.svn diffs should always be applied in the root of the checkout', function( done ) {

		expect( patch.moveToSrc( developSvn ) ).to.not.be.true;
		expect( patch.moveToSrc( developIndexSvn ) ).to.not.be.true;

		done();
	});

	it( 'core.git.wordpress.org diffs should always be applied in the svn folder', function( done ) {

		expect( patch.moveToSrc( coreGit ) ).to.be.true;

		done();
	});

	it( 'core.svn.wordpress.org diffs should always be applied in the svn folder', function( done ) {

		expect( patch.moveToSrc( coreSvn ) ).to.be.true;

		done();
	});

	it( 'core.svn.wordpress.org diffs from trunk should always be applied in the src folder', function( done ) {

		expect( patch.moveToSrc( coreTrunkSvn ) ).to.be.true;
		expect( patch.isAb( coreTrunkSvn ) ).to.be.true;

		done();
	});

	it( 'index.php should always be applied in the src folder', function( done ) {

		expect( patch.moveToSrc( coreIndexSvn ) ).to.be.true;
		expect( patch.moveToSrc( coreIndexGit ) ).to.be.true;

		done();

	});

	it( 'wp-config-sample.php should always be applied in the root folder', function( done ) {
		expect( patch.moveToSrc( developSampleSvn ) ).to.not.be.true;
		expect( patch.moveToSrc( developSampleGit ) ).to.not.be.true;

		done();

	});

	it ( 'isAb should return true on patches with a/ b/ style', function( done ) {

		expect( patch.isAb( abyes ) ).to.be.true;

		done();
	});

	it ( 'isAb should return false on patches without a/ b/ style', function( done ) {

		expect( patch.isAb( developSampleGit ) ).to.not.be.true;
		expect( patch.isAb( developSampleSvn ) ).to.not.be.true;
		expect( patch.isAb( coreIndexGit ) ).to.not.be.true;
		expect( patch.isAb( coreIndexSvn ) ).to.not.be.true;
		expect( patch.isAb( coreGit ) ).to.not.be.true;
		expect( patch.isAb( coreSvn ) ).to.not.be.true;
		expect( patch.isAb( developGit ) ).to.not.be.true;
		expect( patch.isAb( developSvn ) ).to.not.be.true;
		expect( patch.isAb( developIndexGit ) ).to.not.be.true;
		expect( patch.isAb( developIndexSvn ) ).to.not.be.true;
		expect( patch.isAb( testsGit ) ).to.not.be.true;
		expect( patch.isAb( testsSvn ) ).to.not.be.true;

		done();
	});

});
