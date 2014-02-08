var url = require( 'url' )
	, grunt = require( 'grunt' )

module.exports = {
	convert_to_raw : function ( parsed_url, options ){
		grunt.log.debug( 'convert_to_raw: ' + JSON.stringify(parsed_url ) )
		parsed_url.pathname = parsed_url.pathname.replace(/attachment/, "raw-attachment")
		grunt.log.debug( 'converted_from_raw: ' + url.format( parsed_url ) )
		return url.format( parsed_url )
	}

}
