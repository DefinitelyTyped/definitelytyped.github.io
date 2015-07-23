/* jshint -W014 */

var docpadConfig = {
    ignoreCustomPatterns: /\.d\.ts$/i,
	templateData: {
		site: {
			url: 'http://definitelytyped.org',
			github: 'https://github.com/borisyankov/DefinitelyTyped',
            edit: 'https://github.com/DefinitelyTyped/definitelytyped.github.io/edit/source/src/documents/',
			ref: 'github.com/borisyankov/DefinitelyTyped',
			home: '/',
			gh: {
				user: 'borisyankov',
				repo: 'DefinitelyTyped'
			},
			oldUrls: [],
			title: 'DefinitelyTyped',
			description: 'The repository for high quality TypeScript type definitions',
			tagline: 'The repository for high quality TypeScript type definitions',
			keywords: 'typescript, type, definition, declaration, repository, typing',
			styles: [
				'http://fonts.googleapis.com/css?family=Raleway:400,700|Open+Sans:400italic,400,700',
				'/assets/styles/main.css'
			],
			scripts: [
				'/assets/scripts/lib/jquery-min.js',
				'/assets/scripts/lib/underscore-min.js',
				'/assets/scripts/main.js'
			],
			analytics: {
				id: 'UA-47495295-3',
				site: 'definitelytyped.org'
			}
		},
		badges: {
			basic: {
				link: 'http://definitelytyped.org',
				label: 'TypeScript definitions on DefinitelyTyped',
				svg_base: '//definitelytyped.org/badges/standard.svg',
				svg_flat: '//definitelytyped.org/badges/standard-flat.svg'
			}
		},
		link: {
			tsd: {
				web: 'http://definitelytyped.org/tsd/',
				npm: 'https://www.npmjs.org/package/tsd'
			}
		},
		getPreparedTitle: function() {
			if (this.document.title) {
				return '' + this.document.title + ' | ' + this.site.title;
			} else {
				return this.site.title;
			}
		},
		getPreparedDescription: function() {
			return this.document.description || this.site.description;
		},
		getPreparedKeywords: function() {
			return this.site.keywords.concat(this.document.keywords || []).join(', ');
		},
		getBadgeMarkdown: function(type) {
			var link = this.badges.basic.link;
			var label = this.badges.basic.label;
			var image = this.badges.basic.svg_base;
			if (type === 'flat') {
				image = this.badges.basic.svg_flat;
			}
			return '[![' + label +'](' + image +')](' + link +')';
		},
		getBadgeHTML: function(type) {
			var link = this.badges.basic.link;
			var label = this.badges.basic.label;
			var image = this.badges.basic.svg_base;
			if (type === 'flat') {
				image = this.badges.basic.svg_flat;
			}
			return '<a href="' + link +'"><img src="' + image +'" alt="' + label +'"></a>';
		}
	},
	collections: {
		pages: function() {
			return this.getCollection('documents').findAllLive({
				relativeOutDirPath: 'pages'
			});
		},
		guides: function() {
			return this.getCollection('documents').findAllLive({
				relativeOutDirPath: 'guides'
			});
		},
		directory: function() {
			return this.getCollection('documents').findAllLive({
				relativeOutDirPath: 'directory'
			});
		}
	},
	environments: {
		development: {
			templateData: {
				site: {
					url: false
				}
			}
		}
	},
	plugins: {
		marked: {
			markedOptions: require('./lib/markedOptions'),
            markedRenderer: require('./lib/markedRenderer')
		}
	},
	events: {
	}
};

module.exports = docpadConfig;
