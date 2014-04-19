/*
 * may contain a few left-over bytes from https://github.com/shama/grunt-docs,  2013 by Kyle Robinson Young (but not much)
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
	'use strict';

	var assert = require('assert');
	var docpad = require('docpad');

	var watchFull = ['server', 'watch', 'run'];
	function isWatch(action) {
		return action.split(/ +/).some(function(action) {
			return watchFull.indexOf(action) > -1;
		})
	}

	grunt.registerMultiTask('docpad', 'Fun with DocPad', function () {
		var options = this.options({});
		var action = this.data.action;
		assert((typeof action === 'string'), 'action not defined');

		// To allow paths config to use patterns
		Object.keys(options).forEach(function (key) {
			if (key.slice(-5) === 'Paths') {
				options[key] = grunt.file.expand(options[key]);
			}
		});

		var done = this.async();
		docpad.createInstance(options, function (err, inst) {
			inst.action(action, function (err) {
				if (err) {
					return grunt.warn(err);
				}
				if (!isWatch(action)) {
					done();
				}
			});
		});
	});
};
