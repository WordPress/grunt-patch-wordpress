const _ = require( 'underscore' );

module.exports = {
	patchAttachments( html ) {
		return html.match( /<dt>\s*<a\s+href="([^"]+?)(diff|patch)"\s+title="View attachment">([^<]+)/g );
	},
	urlsFromAttachmentList( html ) {
		return html.match( /href="([^"]+)"/ );
	},
	longMatches( html ) {
		return html.match( /<dt([\s|\S]*?)dt>/g );
	},
	possiblePatches( longMatches ) {
		return _.compact( _.map( longMatches, ( match ) => {
			if ( match.match( /(patch|diff)"/ ) ) {
				return match
					// Remove any HTML tags.
					.replace( /<\/?[^>]+>/g, '' )
					// Collapse consecutive whitespace characters into one space.
					.replace( /\s+/g, ' ' )
					.trim();
			}
			return false;
		} ) );
	},
	localFileClean( file ) {
		return file.replace( '?', '' ).replace( /\s/g, '' );
	},

};
