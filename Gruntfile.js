module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-gh-pages');

	grunt.loadTasks('./tasks');

	function getDeployMessage() {
		var ret = '\n\n';
		if (process.env.TRAVIS !== 'true') {
			ret += 'did not run on travis-ci';
			return ret;
		}
		ret += 'branch:       ' + (process.env.TRAVIS_BRANCH || '<unknown>') + '\n';
		ret += 'SHA:          ' + (process.env.TRAVIS_COMMIT || '<unknown>') + '\n';
		ret += 'range SHA:    ' + (process.env.TRAVIS_COMMIT_RANGE || '<unknown>') + '\n';
		ret += 'build id:     ' + (process.env.TRAVIS_BUILD_ID || '<unknown>') + '\n';
		ret += 'build number: ' + (process.env.TRAVIS_BUILD_NUMBER || '<unknown>') + '\n';
		return ret;
	}
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
		'gh-pages': {
			options: {
				base: 'out',
				branch: 'master'
			},
			publish: {
				options: {
					repo: 'https://github.com/DefinitelyTyped/definitelytyped.github.io.git',
					message: 'publish (cli)'
				},
				src: ['**']
			},
			deploy: {
				options: {
					repo: 'https://' + process.env.GH_TOKEN + '@github.com/DefinitelyTyped/definitelytyped.github.io.git',
					message: 'publish (auto)' + getDeployMessage(),
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

		if (process.env.TRAVIS === 'true' && process.env.TRAVIS_PULL_REQUEST === 'false') {
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
