module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-gh-pages');

	grunt.loadTasks('./tasks');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			out: [
				'out/**/*'
			]
		},
		jshint: {
			options: grunt.util._.extend(grunt.file.readJSON('.jshintrc'), {
				reporter: './node_modules/jshint-path-reporter',
				node: true
			}),
			support: {
				src: ['Gruntfile.js', 'docpad.js']
			},
			source: ['src/documents/scripts/**/*.js']
		},
		copy: {
			rootfiles: {
				src: ['README.md', 'LICENCE*'],
				dest: 'out/'
			}
		},
		'gh-pages': {
			options: {
				base: 'out',
				branch: 'master'
			},
			publish: {
				options: {
					repo: 'https://github.com/DefinitelyTyped/definitelytyped.github.io.git',
					message: 'Publish (cli)'
				},
				src: ['**']
			},
			deploy: {
				options: {
					repo: 'https://' + process.env.GH_TOKEN + '@github.com/DefinitelyTyped/definitelytyped.github.io.git',
					message: 'Publish (auto)',
					silent: true,
					user: {
						name: 'dt-bot',
						email: 'definitelytypedbot@gmail.com'
					}
				},
				src: ['**']
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

	grunt.registerTask('check-deploy', function() {
		this.requires(['build']);

		if (process.env.TRAVIS === 'true' && process.env.TRAVIS_SECURE_ENV_VARS === 'true' && process.env.TRAVIS_PULL_REQUEST === 'false') {
			grunt.log.writeln('executing deployment');
			grunt.task.run('gh-pages:deploy');
		}
		else {
			grunt.log.writeln('skipping deployment');
		}
	});

	//
	grunt.registerTask('prep', 'Clean and prepare.', [
		'clean:out',
		'jshint:support',
		'jshint:source',
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

	grunt.registerTask('publish', 'Build and push to master using CLI.', [
		'build',
		'gh-pages:publish'
	]);

	grunt.registerTask('deploy', 'Build with production env for bot.', [
		'build',
		'check-deploy'
	]);

	grunt.registerTask('default', ['build']);
};
