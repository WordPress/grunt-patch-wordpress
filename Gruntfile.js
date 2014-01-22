/*
 * grunt-patch-wordpress
 * https://github.com/aaronjorbin/grunt-patch-wordpress
 *
 * Copyright (c) 2013 Aaron Jorbin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	require('time-grunt')(grunt);

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'lib/*.js',
				'tests/**/*.js'
			],
			options: {
				jshintrc: '.jshintrc',
			},
		},

	// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp'],
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
					'lib/*.js',
					'tasks/**/*.js',
					'test/**/*.js'
				],
				tasks: [
					'test'
				]
			}
		},
		mochaTest: {
			notify: {
				src: 'test/**/*.js',
				options: {
					reporter: 'spec'
				}
			}
		}
	});

	require('load-grunt-tasks')(grunt);
	grunt.loadTasks('tasks');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['jshint', 'clean', 'mochaTest']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'notify']);

};
