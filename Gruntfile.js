module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.loadTasks('./tasks');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			out: [
				'out/**/*'
			]
		},
		copy: {
			rootfiles: {
				src: ['README.md', 'LICENCE*'],
				dest: 'out/'
			}
		},
		docpad: {
			options: require('./docpad'),
			generate: {
				action: 'generate'
			},
			publish: {
				action: 'generate',
				options: {
					env: 'production'
				}
			},
			run: {
				action: 'run'
			}
		}
	});

	//
	grunt.registerTask('prep', 'Clean and prepare.', [
		'clean:out',
	]);

	grunt.registerTask('test', 'Build in development env and run tests.', [
		'prep',
		'docpad:generate',
		// more
	]);

	grunt.registerTask('watch', 'Start watch and run LiveReload server on  development env.', [
		'prep',
		'docpad:run',
	]);

	grunt.registerTask('build', 'Build with production env.', [
		'prep',
		'docpad:publish',
		'copy:rootfiles'
	]);

	grunt.registerTask('default', ['build']);
};
