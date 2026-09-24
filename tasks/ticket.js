/*
 * grunt-patch-wordpress
 * https://github.com/WordPress/grunt-patch-wordpress
 *
 * Copyright (c) 2013 Aaron Jorbin
 * Licensed under the MIT license.
 */

const tracBrowser = require( '../lib/trac-browser.js' );
const { ticketUrl, formatTicket } = require( '../lib/ticket-format.js' );

module.exports = function ( grunt ) {
	const defaults = {
		tracUrl: 'core.trac.wordpress.org',
	};

	grunt.registerTask(
		'ticket',
		'Read a Trac ticket: grunt ticket:15705 (add --json for structured output)',
		function ( ticket, afterProtocol ) {
			const options = this.options( defaults );

			// URLs contain a ":", which grunt uses as the argument separator.
			if ( 'undefined' !== typeof afterProtocol ) {
				ticket = ticket + ':' + afterProtocol;
			}

			const url = ticketUrl( ticket, options.tracUrl );
			if ( ! url ) {
				grunt.fail.warn(
					'A ticket number or ticket URL is required, e.g. grunt ticket:15705'
				);
				return;
			}

			const done = this.async();
			grunt.log.debug( 'ticket url: ' + url );

			tracBrowser
				.readTicket( url )
				.then( ( data ) => {
					if ( grunt.option( 'json' ) ) {
						grunt.log.writeln( JSON.stringify( data, null, 2 ) );
					} else {
						grunt.log.writeln( formatTicket( data ) );
					}
				} )
				.then(
					() => tracBrowser.close().then( () => done() ),
					( error ) =>
						tracBrowser.close().then( () => {
							grunt.fail.warn( error.message );
							done( false );
						} )
				);
		}
	);
};
