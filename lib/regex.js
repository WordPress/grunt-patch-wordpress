var _ = require( 'underscore' )

_.str = _.str = require('underscore.string')
_.mixin( _.str.exports() )

module.exports = {
	patch_attachments : function( html ) {
		return html.match( /<dt>\s*<a\s+href="([^"]+?)(diff|patch)"\s+title="View attachment">([^<]+)/g )
	} ,
	urls_from_attachment_list : function( html ) {
		return html.match( /href="([^"]+)"/ )
	} ,
	long_matches: function( html ) {
		return html.match( /<dt([\s|\S]*?)dt>/g )
	} ,
	possible_patches: function( long_matches ) {
		return _.compact( _.map( long_matches, function( match ) {
			if( match.match(/(patch|diff)"/ ) ) {
				return _.clean( _.trim( _(match).stripTags().replace( /\n/g, ' ' ) ) )
			} else {
				return false
			}
		} ) )
	},
	local_file_clean: function( file ) {
		return file.replace( '?', '' ).replace( /\s/g, '' )
	},


}
