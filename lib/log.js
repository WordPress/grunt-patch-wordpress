const chalk = require( 'chalk' );

const ERROR = chalk.reset.inverse.bold.red( ' ERROR ' );

const grunt = require( 'grunt' );

const logger = function () {
	this.isVerbose = () => {
		// Eventually replace this
		return grunt.log._options.verbose || grunt.log._options.debug;
	};

	this.isDebug = () => {
		return grunt.log._options.verbose || grunt.log._options.debug;
	};

	this.write = ( msg ) => {
		process.stdout.write( msg );
	};

	this.debug = ( msg ) => {
		if ( this.isDebug ) {
			this.write( `DEBUG: ${ msg } ` );
		}
	};

	this.error = ( msg ) => {
		this.write( `${ ERROR } ${ msg }` );
	};

	this.notice = ( msg ) => {
		this.write( msg );
	};

	this.verbose = ( msg ) => {
		if ( this.isVerbose ) {
			this.write( msg );
		}
	};
};

const log = new logger();

module.exports = log;
