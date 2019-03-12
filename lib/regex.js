const _ = require( 'underscore' );

_.str = _.str = require( 'underscore.string' );
_.mixin( _.str.exports() );

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
				return _.clean( _.trim( _( match ).stripTags().replace( /\n/g, ' ' ) ) );
			}
			return false;
		} ) );
	},
	localFileClean( file ) {
		return file.replace( '?', '' ).replace( /\s/g, '' );
	},

};
