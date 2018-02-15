var grunt = require( 'grunt' );

/**
 * Replaces filenames in the passed file_path with the filenames in the file_mappings.
 *
 * @param file_path The path to the file where the filenames should be replaced.
 * @param file_mappings The filenames to replace and the filenames they should be replaced with.
 */
function map_old_to_new_file_path ( file_path, file_mappings ) {
	var body = grunt.file.read( file_path ), new_body;
	for ( var old_path in file_mappings ) {

		// Ensure only own properties are looped over.
		if ( !file_mappings.hasOwnProperty( old_path ) ) {
			continue;
		}

		// Regex to match the second filename of the diff header.
		var header_regex = new RegExp( "((diff \\-\\-git .* )(" + old_path + ")(\\n))", "ig" );

		// Regex to match the old and new file name of the chunks within the diff.
		var chunk_filename_regex = new RegExp( "((-{3}|\\+{3})( " + old_path + "))", "ig" );

		if ( !body.match( chunk_filename_regex ) ) {
			continue;
		}

		var new_path = file_mappings[ old_path ];

		new_body = body.replace( chunk_filename_regex, "$2 " + new_path );
		new_body = new_body.replace( header_regex, "$2" + new_path + "$4" );

		// Logs the mapping.
		if ( body !== new_body ) {
			console.log( "Old file path " + old_path + " found in patch. This path has been automatically replaced by " + new_path + "." );
		}
	}

	// new_body only has a value when there was a match.
	if ( new_body ) {
		grunt.file.write( file_path, new_body );
	}
}

module.exports = map_old_to_new_file_path;
