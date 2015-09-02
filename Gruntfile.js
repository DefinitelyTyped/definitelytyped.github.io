module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-spritesmith');

	grunt.loadTasks('./tasks');
    grunt.renameTask('watch', 'grunt-watch');

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
		},
		sass: {
			options: {
				sourceMap: false
			},
            default: {
				files: {
					'src/files/assets/styles/main.css': 'src/assets/styles/main.sass'
				}
			}
		},
		autoprefixer: {
			options: {
				browsers: ['> 1%', 'last 2 versions', 'ie 8', 'ie 9']
			},
			default: {
				files: {
					'src/files/assets/styles/main.css': 'src/files/assets/styles/main.css'
				}
			}
		},
        ts: {
            defaultdefault : {
                files: [{
                    src: ['src/assets/scripts/**/*.ts'],
                    dest: 'src/files/assets/scripts/main.js'
                }],
                options: {
                    fast: 'never',
                    sourceMap: false
                }
            }
        },
		uglify: {
			default: {
				files: {
					'src/files/assets/scripts/main-min.js': [
						'src/files/assets/scripts/lib/underscore-min.js',
						'src/files/assets/scripts/lib/backbone-min.js',
						'src/files/assets/scripts/lib/backbone.nativeview.js',
						'src/files/assets/scripts/main.js'
					]
				}
			}
		},
		sprite:{
			default: {
				src: 'src/assets/sprites/**/*.png',
				dest: 'src/files/assets/images/sprites.png',
				destCss: 'src/assets/styles/dt/_sprites.sass',
				imgPath: '../images/sprites.png',
				padding: 2,
				retinaSrcFilter: 'src/assets/sprites/**/*-2x.png',
				retinaDest: 'src/files/assets/images/sprites-2x.png',
				retinaImgPath: '../images/sprites-2x.png'
			}
		},
        'grunt-watch': {
            sass: {
                files: ['src/assets/styles/**/*'],
                tasks: ['sass', 'autoprefixer']
            },
            ts: {
                files: ['src/assets/scripts/**/*'],
                tasks: ['ts', 'uglify']
            },
			sprite: {
				files: ['src/assets/sprites/**/*'],
				tasks: ['sprite']
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
		'jshint:source'
	]);

	grunt.registerTask('test', 'Build in development env and run tests.', [
		'prep',
		'docpad:generate'
		// more
	]);

	grunt.registerTask('watch', 'Start watch and run LiveReload server on  development env.', [
		'prep',
		'docpad:run'
	]);

	grunt.registerTask('build', 'Build with production env.', [
		'prep',
        'sass',
		'autoprefixer',
        'ts',
		'uglify',
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
