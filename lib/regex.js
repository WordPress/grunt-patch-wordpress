var _ = require( 'underscore' );

_.str = _.str = require( 'underscore.string' );
_.mixin( _.str.exports() );

module.exports = {
	patchAttachments: function( html ) {
		return html.match( /<dt>\s*<a\s+href="([^"]+?)(diff|patch)"\s+title="View attachment">([^<]+)/g );
	},
	urlsFromAttachmentList: function( html ) {
		return html.match( /href="([^"]+)"/ );
	},
	longMatches: function( html ) {
		return html.match( /<dt([\s|\S]*?)dt>/g );
	},
	possiblePatches: function( longMatches ) {
		return _.compact( _.map( longMatches, function( match ) {
			if ( match.match( /(patch|diff)"/ ) ) {
				return _.clean( _.trim( _( match ).stripTags().replace( /\n/g, ' ' ) ) );
			} else {
				return false;
			}
		}) );
	},
	localFileClean: function( file ) {
		return file.replace( '?', '' ).replace( /\s/g, '' );
	}


};
