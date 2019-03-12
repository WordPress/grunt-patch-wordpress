var grunt = require( 'grunt' ),
	_ = require( 'underscore' );

_.str = _.str = require( 'underscore.string' );
_.mixin( _.str.exports() );

module.exports = {
	isAb: function( diff ) {
		var ab = false;
		try {
			diff = diff.split( '\n' );
			_.each( diff, function( line ) {
				if ( _.startsWith( line, 'diff --git a/' ) ) {
					throw true;
				}
				if ( _.startsWith( line, 'Index: trunk/wp-' ) ) {
					throw true;
				}
			});
		} catch ( e ) {
			ab = e;
		}

		return ab;
	},

	/**
		Check to see if we should apply the diff from the src dir

		@returns bool true if we should go into src to apply the diff
	*/
	moveToSrc: function( diff ) {
		var src = false,
			wpDashExceptions = [
				'.editorconfig',
				'.gitignore',
				'.jshintrc',
				'.travis.yml',
				'Gruntfile.js',
				'package.json',
				'phpunit.xml.dist',
				'wp-cli.yml',
				'wp-config-sample.php',
				'wp-tests-config-sample.php'
			],
			noWpDashExceptions = [
				'index.php',
				'license.txt',
				'readme.html',
				'xmlrpc.php'
			];

		try {
			diff = diff.split( '\n' );
			_.each( diff, function( line ) {

				// these are often the first line
				if ( _.startsWith( line, 'Index: src/'       ) ||
					_.startsWith( line, 'Index: tests/'      ) ||
					_.startsWith( line, 'Index: tools/'      ) ||
					_.startsWith( line, 'diff --git src'     ) ||
					_.startsWith( line, 'diff --git test'    ) ||
					_.startsWith( line, 'diff --git tools'   ) ||
					_.startsWith( line, 'diff --git a/src'   ) ||
					_.startsWith( line, 'diff --git a/test'  ) ||
					_.startsWith( line, 'diff --git a/tools' )

				) {
					throw false;
				}

				_.each( wpDashExceptions, function( exception ) {
					if ( _.startsWith( line, 'Index: ' + exception      ) ||
						_.startsWith( line, 'diff --git ' + exception   ) ||
						_.startsWith( line, 'diff --git a/' + exception )
					) {
						throw false;
					}
				});

				_.each( noWpDashExceptions, function( exception ) {
					if ( _.startsWith( line, 'Index: ' + exception      ) ||
						_.startsWith( line, 'diff --git ' + exception   ) ||
						_.startsWith( line, 'diff --git a/' + exception )
					) {
						throw true;
					}
				});

				if ( _.startsWith( line, 'Index: wp-'      ) ||
					_.startsWith( line, 'Index: trunk/wp-' ) ||
					_.startsWith( line, 'diff --git wp-'   ) ||
					_.startsWith( line, 'diff --git a/wp-' )
				) {
					throw true;
				}

			});
			throw true;
		} catch ( l ) {
			src = l;
		}
		return src;
	}


};
