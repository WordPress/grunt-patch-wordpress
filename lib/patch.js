var grunt = require( 'grunt' )
	, _ = require( 'underscore' )

module.exports = {

	level_calculator : function( diff ){
		var level = 0
		try {
			diff = diff.split( '\n' )
			_.each( diff, function( line ) {
				if ( _.startsWith( line, 'diff --git a/' ) ) {
					throw 1
				}
				if ( _.startsWith( line, 'Index: src/' ) ) {
					throw 0
				}
				if ( _.startsWith( line, '+++ src/' ) ) {
					throw 1
				}
			})
			throw 0
		} catch( l ) {
			level = l	
		}

		return level
	}

}
