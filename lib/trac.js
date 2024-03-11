const url = require( 'url' );
const log = require( './log' );

module.exports = {
	convertToRaw( parsedUrl ) {
		log.debug( 'convertToRaw: ' + JSON.stringify( parsedUrl ) );
		parsedUrl.pathname = parsedUrl.pathname.replace(
			/attachment/,
			'raw-attachment'
		);
		log.debug( 'converted_from_raw: ' + url.format( parsedUrl ) );
		return url.format( parsedUrl );
	},
};
