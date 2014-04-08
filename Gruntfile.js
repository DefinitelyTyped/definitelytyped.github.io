module.exports = function (grunt) {
	'use strict';

	var path = require('path');

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.loadTasks('./tasks')

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			out: [
				'out/**/*'
			]
		},
		'gh-pages': {
			options: {
				base: 'out',
				branch: 'master',
				repo: 'https://github.com/DefinitelyTyped/definitelytyped.github.io.git'
			},
			src: '**/*'
		},
		docpad: {
			options: require('./docpad'),
			generate: {
				action: 'generate'
			},
			run: {
				action: 'run'
			}
		}
	});

	grunt.registerTask('prep', [
		'clean:out',
	]);
	grunt.registerTask('build', [
		'prep',
		'docpad:generate',
	]);
	grunt.registerTask('test', [
		'build',
	]);
	grunt.registerTask('publish', [
		'test',
		'gh-pages',
	]);

	grunt.registerTask('watch', [
		'prep',
		'docpad:run',
	]);

	grunt.registerTask('default', ['build']);
};
