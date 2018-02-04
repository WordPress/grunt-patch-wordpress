/*
 * grunt-patch-wordpress
 * https://github.com/aaronjorbin/grunt-patch-wordpress
 * Based on https://gist.github.com/markjaquith/4219135
 *
 *
 * Copyright (c) 2013 Aaron Jorbin
 * Licensed under the MIT license.
 */

var request = require( 'request' )
	, exec =  require( 'child_process' ).exec
	, spawn = require( 'child_process' ).spawn
	, inquirer = require( 'inquirer' )
	, url = require( 'url' )
	, fs = require( 'fs' )
	, _ = require( 'underscore' )
	, trac = require( '../lib/trac.js' )
	, patch = require( '../lib/patch.js' )
	, regex = require( '../lib/regex.js' )
	, xmlrpc = require('xmlrpc')

_.str = _.str = require('underscore.string')
_.mixin( _.str.exports() )


module.exports = function(grunt) {
	var temp_file = 'wppatch.diff'
			, defaults = {
			tracUrl : 'core.trac.wordpress.org'
		}


	function is_svn(){
		return fs.existsSync('.svn')
	}

	function working_dir(){
		return process.cwd()
	}

	function apply_patch( patch_url , done , options ){
		grunt.verbose.write( patch_url )
		parsed_url = url.parse( patch_url )

		// What to do when either our patch is ready
		grunt.event.once('fileReady', function(level, move_to_src){
			var patchOptions = {}
				, patchArgs = []
				, patchProcess

			// Set patch process to use the existing I/O streams, which will output
			// the command's results and allow for user input on patch error
			patchOptions.stdio = 'inherit'

			// Decide if we need to be in src
			if ( move_to_src ) {
				patchOptions.cwd =  working_dir() + '/src'
				temp_file = working_dir() + '/' + temp_file
			}

			// Set the patch command's arguments
			patchArgs.push( '-p' + level )
			patchArgs.push( '--input=' + temp_file )

			grunt.log.debug( 'patch options: ' + JSON.stringify( patchOptions ) )
			grunt.log.debug( 'patch arguments: ' + JSON.stringify( patchArgs ) )
			grunt.log.debug( 'patch temp_file: ' + JSON.stringify( temp_file ) )

			map_old_to_new_file_name( temp_file );

			patchProcess = spawn( 'patch', patchArgs, patchOptions )

			patchProcess.on('exit', function( code, signal ) {
				if ( signal ) {
					grunt.log.debug( 'error signal: ' + signal )

				}

				// if debug is enabled, don't delete the file
				if ( grunt.option( 'debug' ) ) {
					grunt.log.debug( 'File Saved' )
				} else {
					grunt.file.delete(temp_file)
				}

				done( code )
			})
		})

		// or we know we have failed
		grunt.event.once('fileFail', function(msg){
			if (typeof msg === 'string') {
				grunt.log.errorlns(msg)
			}

			done(false)
		})

		// if patch_url is a github url
		if ( parsed_url.hostname === 'github.com' ){

			grunt.log.debug( 'github url detected: ' + patch_url )
			if ( patch_url.slice( -5 ) !== '.diff' &&  patch_url.slice( -6 ) !== '.patch' ){
				patch_url += '.diff';
			}
			get_patch( patch_url, options )

		// if patch_url is a full url and is a raw-attachement, just apply it
		} else if( parsed_url.hostname === options.tracUrl && parsed_url.pathname.match(/raw-attachment/) ) {
			get_patch( patch_url, options )

		// if patch_url is full url and is an attachment, convert it to a raw attachment
		} else if ( parsed_url.hostname === options.tracUrl && parsed_url.pathname.match(/attachment/) && parsed_url.pathname.match(/(patch|diff)/ ) ) {
			get_patch( trac.convert_to_raw ( parsed_url, options ) )

		// if patch_url is just a ticket number, get a list of patches on that ticket and allow user to choose one
		} else if (  parsed_url.hostname === options.tracUrl && parsed_url.pathname.match(/ticket/) ) {
			get_patch_from_ticket( patch_url, options )

		// if we just enter a number, assume it is a ticket number
		} else if ( parsed_url.hostname === null && ! parsed_url.pathname.match(/\./) ) {
			get_patch_from_ticket_number( patch_url, options )

		// if patch_url is a local file, just use that
		} else if ( parsed_url.hostname === null ) {
			get_local_patch( patch_url, options )

		// We've failed in our mission
		} else {
			grunt.event.emit('fileFile', 'All matching failed.  Please enter a ticket url, ticket number, patch url')
		}
	}

	var map_old_to_new_file_name = function( file_path ){
		var body = grunt.file.read( file_path );
		for ( var entry in map_object ) {
			// todo remove console.logs
			// Regex to match the second filename of then diff header.
			// todo: regex in name?
			var headerRegex = new RegExp( "((diff \\-\\-git .* )(" + entry + ")(\\n))", "ig");

			// Regex to match the old and new file name of the chunks within the diff.
			// todo: regex in name?
			var chunkFileNameRegex = new RegExp( "((-{3}|\\+{3})( " + entry + "))", "ig");

			// Escape slashes and periods in preparation for the regex replace.
		    var escapedEntry = entry.replace( /\//g, "\\/" );
			escapedEntry = escapedEntry.replace( /\./g, "\\." );
			console.log( "type", typeof body)

			// todo: body.replace is not a function.
			body = body.replace( chunkFileNameRegex, "$2 " + map_object[entry] );
			console.log( "type2", typeof body)

			body = body.replace( headerRegex, "$2 " + map_object[entry] + "$4" );
			console.log( "this is the body", body );


			body = grunt.file.write( file_path, body );
		}
		
		console.log( grunt.file.read( file_path ) );
	};

	var map_object = {
		'src/wp-admin/js/accordion.js': './src/js/_enqueues/lib/accordion.js',
		'src/wp-admin/js/code-editor.js': './src/js/_enqueues/wp/code-editor.js',
		'src/wp-admin/js/color-picker.js': './src/js/_enqueues/lib/color-picker.js',
		'src/wp-admin/js/comment.js': './src/js/_enqueues/admin/comment.js',
		'src/wp-admin/js/common.js': './src/js/_enqueues/admin/common.js',
		'src/wp-admin/js/custom-background.js': './src/js/_enqueues/admin/custom-background.js',
		'src/wp-admin/js/custom-header.js': './src/js/_enqueues/admin/custom-header.js',
		'src/wp-admin/js/customize-controls.js': './src/js/_enqueues/wp/customize/controls.js',
		'src/wp-admin/js/customize-nav-menus.js': './src/js/_enqueues/wp/customize/nav-menus.js',
		'src/wp-admin/js/customize-widgets.js': './src/js/_enqueues/wp/customize/widgets.js',
		'src/wp-admin/js/dashboard.js': './src/js/_enqueues/wp/dashboard.js',
		'src/wp-admin/js/edit-comments.js': './src/js/_enqueues/admin/edit-comments.js',
		'src/wp-admin/js/editor-expand.js': './src/js/_enqueues/wp/editor/dfw.js',
		'src/wp-admin/js/editor.js': './src/js/_enqueues/wp/editor/base.js',
		'src/wp-admin/js/gallery.js': './src/js/_enqueues/lib/gallery.js',
		'src/wp-admin/js/image-edit.js': './src/js/_enqueues/lib/image-edit.js',
		'src/wp-admin/js/inline-edit-post.js': './src/js/_enqueues/admin/inline-edit-post.js',
		'src/wp-admin/js/inline-edit-tax.js': './src/js/_enqueues/admin/inline-edit-tax.js',
		'src/wp-admin/js/language-chooser.js': './src/js/_enqueues/lib/language-chooser.js',
		'src/wp-admin/js/link.js': './src/js/_enqueues/admin/link.js',
		'src/wp-admin/js/media-gallery.js': './src/js/_enqueues/deprecated/media-gallery.js',
		'src/wp-admin/js/media-upload.js': './src/js/_enqueues/admin/media-upload.js',
		'src/wp-admin/js/media.js': './src/js/_enqueues/admin/media.js',
		'src/wp-admin/js/nav-menu.js': './src/js/_enqueues/lib/nav-menu.js',
		'src/wp-admin/js/password-strength-meter.js': './src/js/_enqueues/wp/password-strength-meter.js',
		'src/wp-admin/js/plugin-install.js': './src/js/_enqueues/admin/plugin-install.js',
		'src/wp-admin/js/post.js': './src/js/_enqueues/admin/post.js',
		'src/wp-admin/js/postbox.js': './src/js/_enqueues/admin/postbox.js',
		'src/wp-admin/js/revisions.js': './src/js/_enqueues/wp/revisions.js',
		'src/wp-admin/js/set-post-thumbnail.js': './src/js/_enqueues/admin/set-post-thumbnail.js',
		'src/wp-admin/js/svg-painter.js': './src/js/_enqueues/wp/svg-painter.js',
		'src/wp-admin/js/tags-box.js': './src/js/_enqueues/admin/tags-box.js',
		'src/wp-admin/js/tags-suggest.js': './src/js/_enqueues/admin/tags-suggest.js',
		'src/wp-admin/js/tags.js': './src/js/_enqueues/admin/tags.js',
		'src/wp-admin/js/theme-plugin-editor.js': './src/js/_enqueues/wp/theme-plugin-editor.js',
		'src/wp-admin/js/theme.js': './src/js/_enqueues/wp/theme.js',
		'src/wp-admin/js/updates.js': './src/js/_enqueues/wp/updates.js',
		'src/wp-admin/js/user-profile.js': './src/js/_enqueues/admin/user-profile.js',
		'src/wp-admin/js/user-suggest.js': './src/js/_enqueues/lib/user-suggest.js',
		'src/wp-admin/js/widgets/custom-html-widgets.js': './src/js/_enqueues/wp/widgets/custom-html.js',
		'src/wp-admin/js/widgets/media-audio-widget.js': './src/js/_enqueues/wp/widgets/media-audio.js',
		'src/wp-admin/js/widgets/media-gallery-widget.js': './src/js/_enqueues/wp/widgets/media-gallery.js',
		'src/wp-admin/js/widgets/media-image-widget.js': './src/js/_enqueues/wp/widgets/media-image.js',
		'src/wp-admin/js/widgets/media-video-widget.js': './src/js/_enqueues/wp/widgets/media-video.js',
		'src/wp-admin/js/widgets/media-widgets.js': './src/js/_enqueues/wp/widgets/media.js',
		'src/wp-admin/js/widgets/text-widgets.js': './src/js/_enqueues/wp/widgets/text.js',
		'src/wp-admin/js/widgets.js': './src/js/_enqueues/admin/widgets.js',
		'src/wp-admin/js/word-count.js': './src/js/_enqueues/wp/utils/word-count.js',
		'src/wp-admin/js/wp-fullscreen-stub.js': './src/js/_enqueues/deprecated/fullscreen-stub.js',
		'src/wp-admin/js/xfn.js': './src/js/_enqueues/admin/xfn.js',
		'src/wp-includes/js/admin-bar.js': './src/js/_enqueues/lib/admin-bar.js',
		'src/wp-includes/js/api-request.js': './src/js/_enqueues/wp/api-request.js',
		'src/wp-includes/js/autosave.js': './src/js/_enqueues/wp/autosave.js',
		'src/wp-includes/js/comment-reply.js': './src/js/_enqueues/lib/comment-reply.js',
		'src/wp-includes/js/customize-base.js': './src/js/_enqueues/wp/customize/base.js',
		'src/wp-includes/js/customize-loader.js': './src/js/_enqueues/wp/customize/loader.js',
		'src/wp-includes/js/customize-models.js': './src/js/_enqueues/wp/customize/models.js',
		'src/wp-includes/js/customize-preview-nav-menus.js': './src/js/_enqueues/wp/customize/preview-nav-menus.js',
		'src/wp-includes/js/customize-preview-widgets.js': './src/js/_enqueues/wp/customize/preview-widgets.js',
		'src/wp-includes/js/customize-preview.js': './src/js/_enqueues/wp/customize/preview.js',
		'src/wp-includes/js/customize-selective-refresh.js': './src/js/_enqueues/wp/customize/selective-refresh.js',
		'src/wp-includes/js/customize-views.js': './src/js/_enqueues/wp/customize/views.js',
		'src/wp-includes/js/heartbeat.js': './src/js/_enqueues/wp/heartbeat.js',
		'src/wp-includes/js/mce-view.js': './src/js/_enqueues/wp/mce-view.js',
		'src/wp-includes/js/media-editor.js': './src/js/_enqueues/wp/media/editor.js',
		'src/wp-includes/js/quicktags.js': './src/js/_enqueues/lib/quicktags.js',
		'src/wp-includes/js/shortcode.js': './src/js/_enqueues/wp/shortcode.js',
		'src/wp-includes/js/utils.js': './src/js/_enqueues/lib/cookies.js',
		'src/wp-includes/js/wp-a11y.js': './src/js/_enqueues/wp/a11y.js',
		'src/wp-includes/js/wp-ajax-response.js': './src/js/_enqueues/lib/ajax-response.js',
		'src/wp-includes/js/wp-api.js': './src/js/_enqueues/wp/api.js',
		'src/wp-includes/js/wp-auth-check.js': './src/js/_enqueues/lib/auth-check.js',
		'src/wp-includes/js/wp-backbone.js': './src/js/_enqueues/wp/backbone.js',
		'src/wp-includes/js/wp-custom-header.js': './src/js/_enqueues/wp/custom-header.js',
		'src/wp-includes/js/wp-embed-template.js': './src/js/_enqueues/lib/embed-template.js',
		'src/wp-includes/js/wp-embed.js': './src/js/_enqueues/wp/embed.js',
		'src/wp-includes/js/wp-emoji-loader.js': './src/js/_enqueues/lib/emoji-loader.js',
		'src/wp-includes/js/wp-emoji.js': './src/js/_enqueues/wp/emoji.js',
		'src/wp-includes/js/wp-list-revisions.js': './src/js/_enqueues/lib/list-revisions.js',
		'src/wp-includes/js/wp-lists.js': './src/js/_enqueues/lib/lists.js',
		'src/wp-includes/js/wp-pointer.js': './src/js/_enqueues/lib/pointer.js',
		'src/wp-includes/js/wp-sanitize.js': './src/js/_enqueues/wp/sanitize.js',
		'src/wp-includes/js/wp-util.js': './src/js/_enqueues/wp/util.js',
		'src/wp-includes/js/wpdialog.js': './src/js/_enqueues/lib/dialog.js',
		'src/wp-includes/js/wplink.js': './src/js/_enqueues/lib/link.js',
		'src/wp-includes/js/zxcvbn-async.js': './src/js/_enqueues/lib/zxcvbn-async.js',
		'src/wp-includes/js/media/controllers/audio-details.js' : './src/js/media/controllers/audio-details.js',
		'src/wp-includes/js/media/controllers/collection-add.js' : './src/js/media/controllers/collection-add.js',
		'src/wp-includes/js/media/controllers/collection-edit.js' : './src/js/media/controllers/collection-edit.js',
		'src/wp-includes/js/media/controllers/cropper.js' : './src/js/media/controllers/cropper.js',
		'src/wp-includes/js/media/controllers/customize-image-cropper.js' : './src/js/media/controllers/customize-image-cropper.js',
		'src/wp-includes/js/media/controllers/edit-attachment-metadata.js' : './src/js/media/controllers/edit-attachment-metadata.js',
		'src/wp-includes/js/media/controllers/edit-image.js' : './src/js/media/controllers/edit-image.js',
		'src/wp-includes/js/media/controllers/embed.js' : './src/js/media/controllers/embed.js',
		'src/wp-includes/js/media/controllers/featured-image.js' : './src/js/media/controllers/featured-image.js',
		'src/wp-includes/js/media/controllers/gallery-add.js' : './src/js/media/controllers/gallery-add.js',
		'src/wp-includes/js/media/controllers/gallery-edit.js' : './src/js/media/controllers/gallery-edit.js',
		'src/wp-includes/js/media/controllers/image-details.js' : './src/js/media/controllers/image-details.js',
		'src/wp-includes/js/media/controllers/library.js' : './src/js/media/controllers/library.js',
		'src/wp-includes/js/media/controllers/media-library.js' : './src/js/media/controllers/media-library.js',
		'src/wp-includes/js/media/controllers/region.js' : './src/js/media/controllers/region.js',
		'src/wp-includes/js/media/controllers/replace-image.js' : './src/js/media/controllers/replace-image.js',
		'src/wp-includes/js/media/controllers/site-icon-cropper.js' : './src/js/media/controllers/site-icon-cropper.js',
		'src/wp-includes/js/media/controllers/state-machine.js' : './src/js/media/controllers/state-machine.js',
		'src/wp-includes/js/media/controllers/state.js' : './src/js/media/controllers/state.js',
		'src/wp-includes/js/media/controllers/video-details.js' : './src/js/media/controllers/video-details.js',
		'src/wp-includes/js/media/models/attachment.js' : './src/js/media/models/attachment.js',
		'src/wp-includes/js/media/models/attachments.js' : './src/js/media/models/attachments.js',
		'src/wp-includes/js/media/models/post-image.js' : './src/js/media/models/post-image.js',
		'src/wp-includes/js/media/models/post-media.js' : './src/js/media/models/post-media.js',
		'src/wp-includes/js/media/models/query.js' : './src/js/media/models/query.js',
		'src/wp-includes/js/media/models/selection.js' : './src/js/media/models/selection.js',
		'src/wp-includes/js/media/routers/manage.js' : './src/js/media/routers/manage.js',
		'src/wp-includes/js/media/utils/selection-sync.js' : './src/js/media/utils/selection-sync.js',
		'src/wp-includes/js/media/views/attachment-compat.js' : './src/js/media/views/attachment-compat.js',
		'src/wp-includes/js/media/views/attachment-filters.js' : './src/js/media/views/attachment-filters.js',
		'src/wp-includes/js/media/views/attachment-filters/all.js' : './src/js/media/views/attachment-filters/all.js',
		'src/wp-includes/js/media/views/attachment-filters/date.js' : './src/js/media/views/attachment-filters/date.js',
		'src/wp-includes/js/media/views/attachment-filters/uploaded.js' : './src/js/media/views/attachment-filters/uploaded.js',
		'src/wp-includes/js/media/views/attachment.js' : './src/js/media/views/attachment.js',
		'src/wp-includes/js/media/views/attachment/details-two-column.js' : './src/js/media/views/details-two-column.js',
		'src/wp-includes/js/media/views/attachment/details.js' : './src/js/media/views/details.js',
		'src/wp-includes/js/media/views/attachment/edit-library.js' : './src/js/media/views/edit-library.js',
		'src/wp-includes/js/media/views/attachment/edit-selection.js' : './src/js/media/views/edit-selection.js',
		'src/wp-includes/js/media/views/attachment/library.js' : './src/js/media/views/library.js',
		'src/wp-includes/js/media/views/attachment/selection.js' : './src/js/media/views/selection.js',
		'src/wp-includes/js/media/views/attachment/attachments.js' : './src/js/media/views/attachments.js',
		'src/wp-includes/js/media/views/attachments/browser.js' : './src/js/media/views/attachments/browser.js',
		'src/wp-includes/js/media/views/attachments/selection.js' : './src/js/media/views/attachments/selection.js',
		'src/wp-includes/js/media/views/attachments/audio-details.js' : './src/js/media/views/attachments/audio-details.js',
		'src/wp-includes/js/media/views/attachments/button-group.js' : './src/js/media/views/attachments/button-group.js',
		'src/wp-includes/js/media/views/attachments/button.js' : './src/js/media/views/attachments/button.js',
		'src/wp-includes/js/media/views/button/delete-selected-permanently.js' : './src/js/media/views/button/delete-selected-permanently.js',
		'src/wp-includes/js/media/views/button/delete-selected.js' : './src/js/media/views/button/delete-selected.js',
		'src/wp-includes/js/media/views/button/select-mode-toggle.js' : './src/js/media/views/button/select-mode-toggle.js',
		'src/wp-includes/js/media/views/cropper.js' : './src/js/media/views/cropper.js',
		'src/wp-includes/js/media/views/edit-image-details.js' : './src/js/media/views/edit-image-details.js',
		'src/wp-includes/js/media/views/edit-image.js' : './src/js/media/views/edit-image.js',
		'src/wp-includes/js/media/views/embed.js' : './src/js/media/views/embed.js',
		'src/wp-includes/js/media/views/embed/image.js' : './src/js/media/views/embed/image.js',
		'src/wp-includes/js/media/views/embed/link.js' : './src/js/media/views/embed/link.js',
		'src/wp-includes/js/media/views/embed/url.js' : './src/js/media/views/embed/url.js',
		'src/wp-includes/js/media/views/focus-manager.js' : './src/js/media/views/focus-manager.js',
		'src/wp-includes/js/media/views/frame.js' : './src/js/media/views/frame.js',
		'src/wp-includes/js/media/views/frame/audio-details.js' : 'src/js/media/views/frame/audio-details.js',
		'src/wp-includes/js/media/views/frame/edit-attachments.js' : 'src/js/media/views/frame/edit-attachments.js',
		'src/wp-includes/js/media/views/frame/image-details.js' : 'src/js/media/views/frame/image-details.js',
		'src/wp-includes/js/media/views/frame/manage.js' : 'src/js/media/views/frame/manage.js',
		'src/wp-includes/js/media/views/frame/media-details.js' : 'src/js/media/views/frame/media-details.js',
		'src/wp-includes/js/media/views/frame/post.js' : 'src/js/media/views/frame/post.js',
		'src/wp-includes/js/media/views/frame/select.js' : 'src/js/media/views/frame/select.js',
		'src/wp-includes/js/media/views/frame/video-details.js' : 'src/js/media/views/frame/video-details.js',
		'src/wp-includes/js/media/views/iframe.js' : 'src/js/media/views/iframe.js',
		'src/wp-includes/js/media/views/image-details.js' : 'src/js/media/views/image-details.js',
		'src/wp-includes/js/media/views/label.js' : 'src/js/media/views/label.js',
		'src/wp-includes/js/media/views/media-details.js' : 'src/js/media/views/media-details.js',
		'src/wp-includes/js/media/views/media-frame.js' : 'src/js/media/views/media-frame.js',
		'src/wp-includes/js/media/views/menu-item.js' : 'src/js/media/views/menu-item.js',
		'src/wp-includes/js/media/views/menu.js' : 'src/js/media/views/menu.js',
		'src/wp-includes/js/media/views/modal.js' : 'src/js/media/views/modal.js',
		'src/wp-includes/js/media/views/priority-list.js' : 'src/js/media/views/priority-list.js',
		'src/wp-includes/js/media/views/router-item.js' : 'src/js/media/views/router-item.js',
		'src/wp-includes/js/media/views/router.js' : 'src/js/media/views/router.js',
		'src/wp-includes/js/media/views/search.js' : 'src/js/media/views/search.js',
		'src/wp-includes/js/media/views/selection.js' : 'src/js/media/views/selection.js',
		'src/wp-includes/js/media/views/settings.js' : 'src/js/media/views/settings.js',
		'src/wp-includes/js/media/views/settings/attachment-display.js' : 'src/js/media/views/settings/attachment-display.js',
		'src/wp-includes/js/media/views/settings/gallery.js' : 'src/js/media/views/settings/gallery.js',
		'src/wp-includes/js/media/views/settings/playlist.js' : 'src/js/media/views/settings/playlist.js',
		'src/wp-includes/js/media/views/sidebar.js' : 'src/js/media/views/sidebar.js',
		'src/wp-includes/js/media/views/site-icon-cropper.js' : 'src/js/media/views/site-icon-cropper.js',
		'src/wp-includes/js/media/views/site-icon-preview.js' : 'src/js/media/views/site-icon-preview.js',
		'src/wp-includes/js/media/views/spinner.js' : 'src/js/media/views/spinner.js',
		'src/wp-includes/js/media/views/toolbar.js' : 'src/js/media/views/toolbar.js',
		'src/wp-includes/js/media/views/toolbar/embed.js' : 'src/js/media/views/toolbar/embed.js',
		'src/wp-includes/js/media/views/toolbar/select.js' : 'src/js/media/views/toolbar/select.js',
		'src/wp-includes/js/media/views/uploader/editor.js' : 'src/js/media/views/uploader/editor.js',
		'src/wp-includes/js/media/views/uploader/inline.js' : 'src/js/media/views/uploader/inline.js',
		'src/wp-includes/js/media/views/uploader/status-error.js' : 'src/js/media/views/uploader/status-error.js',
		'src/wp-includes/js/media/views/uploader/status.js' : 'src/js/media/views/uploader/status.js',
		'src/wp-includes/js/media/views/uploader/window.js' : 'src/js/media/views/uploader/window.js',
		'src/wp-includes/js/media/views/video-details.js' : 'src/js/media/views/video-details.js',
		'src/wp-includes/js/media/views/view.js' : 'src/js/media/views/view.js',
	};



	function map_moved_files( patch_url ) {

	}

	function get_patch_from_ticket_number( patch_url, options  ){
		grunt.log.debug( 'get_patch_from_ticket_number: ' + patch_url )
		get_patch_from_ticket( 'https://' + options.tracUrl + '/attachment/ticket/' + patch_url + '/', options  )
	}

	function get_patch_from_ticket( patch_url, options ){
		var matches
			, long_matches
			, match_url
			, possible_patches

		grunt.log.debug( 'get_patch_from_ticket: ' + patch_url )
		request( patch_url, function(error, response, body) {
			if ( !error && response.statusCode == 200 ) {
				matches = regex.patch_attachments( body )
				grunt.log.debug( 'matches: ' + JSON.stringify( matches ) )

				if (matches == null) {
					grunt.event.emit('fileFail', patch_url + '\ncontains no attachments')
				} else if (matches.length === 1){
					match_url = options.tracUrl + regex.urls_from_attachment_list(   matches[0] )[1]
					get_patch( trac.convert_to_raw ( url.parse( 'https://' + match_url  ) ), options  )
				} else {
					long_matches = regex.long_matches( body )
					possible_patches = regex.possible_patches( long_matches )

					grunt.log.debug( 'possible_patches: ' + JSON.stringify( possible_patches ) )
					grunt.log.debug( 'long_matches: ' + JSON.stringify( long_matches ) )
					inquirer.prompt([
						{	type: 'list',
							name: 'patch_name',
							message: 'Please select a patch to apply',
							choices: possible_patches,
							// preselect the most recent patch
							default: possible_patches.length - 1
						}
					], function ( answers ) {
						grunt.log.debug( 'answers:' + JSON.stringify(answers) )
						match_url = options.tracUrl
							+ regex.urls_from_attachment_list( matches[ _.indexOf( possible_patches, answers.patch_name) ])[1]
						get_patch( trac.convert_to_raw ( url.parse( 'https://' + match_url  ) ), options  )

					})
				}
			} else {
				// something went wrong
				grunt.event.emit( 'fileFail', 'get_patch_from_ticket fail \n status: ' + response.statusCode )
			}
		})

		grunt.event.emit('fileFile', 'method not available yet')
	}

	function get_local_patch(patch_url) {
		var body = grunt.file.read(patch_url)
			, level = patch.is_ab(body) ? 1 : 0
			, move_to_src = patch.move_to_src( body )

		grunt.file.copy(patch_url, temp_file)
		grunt.event.emit( 'fileReady', level, move_to_src )
	}

	function get_patch( patch_url ){
		grunt.log.debug( 'getting patch: ' + patch_url )
		request(patch_url, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var level = patch.is_ab(body) ? 1 : 0
					, move_to_src = patch.move_to_src( body )

				grunt.file.write( temp_file, body)
				grunt.event.emit( 'fileReady', level, move_to_src )
			} else {
				// something went wrong
				grunt.event.emit('fileFail', 'get_patch_fail \n status: ' + response.statusCode )
			}
		})
	}

	function file_fail( done, msg ) {
		grunt.log.errorlns( 'Nothing to patch.' )
		grunt.log.errorlns( '' )
		grunt.log.errorlns( '' )
		grunt.log.errorlns( 'To use this command, please:' )
		grunt.log.errorlns( '' )
		grunt.log.errorlns( '1) have a diff or patch in your WordPress Directory' )
		grunt.log.errorlns( '' )
		grunt.log.errorlns( '2) enter a ticket number, e.g. grunt patch:15705' )
		grunt.log.errorlns( '' )
		grunt.log.errorlns( '3) enter a ticket url, e.g. grunt patch:https://core.trac.wordpress.org/ticket/15705' )
		grunt.log.errorlns( '' )
		grunt.log.errorlns( '4) enter a patch url, e.g. grunt patch:https://core.trac.wordpress.org/attachment/ticket/11817/13711.diff' )
		grunt.log.errorlns( '' )

		if ( typeof( msg ) === 'string' ) {
			grunt.verbose.errorlns( 'msg: ' + msg )
		}

		done( false )
	}

	function local_file( error, result, code, done, options ) {
		if ( ! error ){
			files = _.filter( result.split( "\n" ) , function( file ) {
				return ( _.str.include( file, 'patch' ) || _.str.include( file, 'diff') )
			})
			grunt.log.debug( 'files: ' + JSON.stringify( files ) )

			if ( files.length === 0 ) {
				file_fail( done )
			} else if ( files.length === 1 ) {
				apply_patch( regex.local_file_clean( files[0] ), done, options )
			} else {
				inquirer.prompt([
					{	type: 'list',
						name: 'file',
						message: 'Please select a file to apply',
						choices: files
					}
				], function ( answers ) {
					var file = regex.local_file_clean( answers.file )
					apply_patch( file , done, options )
				})
			}
		} else {
			file_fail( done , 'local file fail' )
		}
	}


	grunt.registerTask( 'patch_wordpress', 'Patch your develop-wordpress directory like a boss', function( ticket, afterProtocal ) {
		var done = this.async()
		var options = this.options(defaults)

		// since URLs contain a : which is the seperator for grunt, we
		// need to reassemble the url.
		if (typeof afterProtocal !== 'undefined') {
			ticket = ticket + ':' + afterProtocal
		}

		grunt.log.debug( 'ticket: ' + ticket )
		grunt.log.debug( 'options: ' + JSON.stringify( options ) )

		if (typeof ticket === 'undefined'){
			// look for diffs and patches in the root of the checkout and
			// prompt using inquirer to pick one

			var fileFinderCommand = is_svn() ? "svn status " : 'git ls-files --other --exclude-standard'
				, files

			exec(fileFinderCommand , function(error, result, code) {
				local_file( error, result, code, done, options)
			})
		} else {
			apply_patch( ticket , done, options )

		}

	})

	grunt.registerTask( 'upload_patch', 'Upload the current diff of your develop-wordpress directory to Trac', function( ticketNumber ) {
		var done = this.async()
		var options = this.options(defaults)

		grunt.log.debug( 'ticketNumber: ' + ticketNumber )
		grunt.log.debug( 'options: ' + JSON.stringify( options ) )

		ticketNumber = parseInt( ticketNumber, 10 )
		if ( typeof ticketNumber != 'number' ) {
			grunt.fail.warn( 'A ticket number is required to upload a patch.' )
		}

		var uploadPatchWithCredentials = function( username, password ) {
			var diffCommand = is_svn() ? 'svn diff --diff-cmd diff' : 'git diff'

			exec( diffCommand, function(error, result, code) {
				var client = xmlrpc.createSecureClient({
					hostname: options.tracUrl,
					port: 443,
					path: '/login/xmlrpc',
					basic_auth: {
						user: username,
						pass: password
					}
				})
				client.methodCall(
					'ticket.putAttachment',
					[
						ticketNumber,
						ticketNumber + '.diff',
						'', // description. empty for now.
						new Buffer( new Buffer(result).toString('base64'), 'base64'),
						false // never overwrite the old file
					], function( err, value ) {
						if ( err === null ) {
							grunt.log.writeln( 'Uploaded patch.' )
							done()
						} else {
							grunt.fail.warn( 'Something went wrong when attempting to upload the patch. Please confirm your credentials and the ticket number. ' + err )
						}
					}
				)
			})
		}
		inquirer.prompt(
			[
				{ type: 'input', name: 'username', message: 'Enter your WordPress.org username' },
				{ type: 'password', name: 'password', message: 'Enter your WordPress.org password' }
			],
			function(answers) {
				uploadPatchWithCredentials( answers.username, answers.password )
			}
		)
	})

}
