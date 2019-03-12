var grunt = require( 'grunt' ),
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

	it( 'git a/b diffs should not automatticaly trigger moving to src', function() {
		expect( patch.moveToSrc( abyes ) ).not.toBe( true );
	});

	it( 'tests diffs should always be applied in the root of the checkout', function() {

		expect( patch.moveToSrc( testsGit ) ).not.toBe( true );
		expect( patch.moveToSrc( testsSvn ) ).not.toBe( true );
	});

	it( 'dev.git diffs should always be applied in the root of the checkout', function() {

		expect( patch.moveToSrc( developGit ) ).not.toBe( true );
		expect( patch.moveToSrc( developIndexGit ) ).not.toBe( true );
	});

	it( 'dev.svn diffs should always be applied in the root of the checkout', function() {

		expect( patch.moveToSrc( developSvn ) ).not.toBe( true );
		expect( patch.moveToSrc( developIndexSvn ) ).not.toBe( true );
	});

	it( 'core.git.wordpress.org diffs should always be applied in the svn folder', function() {

		expect( patch.moveToSrc( coreGit ) ).toBe( true );
	});

	it( 'core.svn.wordpress.org diffs should always be applied in the svn folder', function() {

		expect( patch.moveToSrc( coreSvn ) ).toBe( true );
	});

	it( 'core.svn.wordpress.org diffs from trunk should always be applied in the src folder', function() {

		expect( patch.moveToSrc( coreTrunkSvn ) ).toBe( true );
		expect( patch.isAb( coreTrunkSvn ) ).toBe( true );
	});

	it( 'index.php should always be applied in the src folder', function() {
		expect( patch.moveToSrc( coreIndexSvn ) ).toBe( true );
		expect( patch.moveToSrc( coreIndexGit ) ).toBe( true );
	});

	it( 'wp-config-sample.php should always be applied in the root folder', function() {
		expect( patch.moveToSrc( developSampleSvn ) ).not.toBe( true );
		expect( patch.moveToSrc( developSampleGit ) ).not.toBe( true );
	});

	it ( 'isAb should return true on patches with a/ b/ style', function() {

		expect( patch.isAb( abyes ) ).toBe( true );
	});

	it ( 'isAb should return false on patches without a/ b/ style', function() {

		expect( patch.isAb( developSampleGit ) ).not.toBe( true );
		expect( patch.isAb( developSampleSvn ) ).not.toBe( true );
		expect( patch.isAb( coreIndexGit ) ).not.toBe( true );
		expect( patch.isAb( coreIndexSvn ) ).not.toBe( true );
		expect( patch.isAb( coreGit ) ).not.toBe( true );
		expect( patch.isAb( coreSvn ) ).not.toBe( true );
		expect( patch.isAb( developGit ) ).not.toBe( true );
		expect( patch.isAb( developSvn ) ).not.toBe( true );
		expect( patch.isAb( developIndexGit ) ).not.toBe( true );
		expect( patch.isAb( developIndexSvn ) ).not.toBe( true );
		expect( patch.isAb( testsGit ) ).not.toBe( true );
		expect( patch.isAb( testsSvn ) ).not.toBe( true );
	});

});
