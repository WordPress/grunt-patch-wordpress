/*
 * grunt-patch-wordpress
 * https://github.com/aaronjorbin/grunt-patch-wordpress
 *
 * Copyright (c) 2013 Aaron Jorbin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
	jshint: {
		all: [
			'Gruntfile.js',
			'tasks/*.js',
			'<%= nodeunit.tests %>',
		],
		options: {
			jshintrc: '.jshintrc',
		},
	},

	// Before generating any new files, remove any previously-created files.
	clean: {
		tests: ['tmp'],
	},

	// Unit tests.
	nodeunit: {
		tests: ['test/*_test.js'],
	},

	notify_hooks: {
		options: {
			enabled: true,
			max_jshint_notifications: 5, // maximum number of notifications from jshint output
		}
	},

	watch: {
		test: {
			options: {
				spawn: true
			},
			files: [
				'Gruntfile.js',
				'tasks/**/*.js',
				'test/**/*.js'
			],
			tasks: [
				'jshint'
			]
		}
	}
  });

  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tasks');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'notify']);

};
