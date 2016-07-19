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
