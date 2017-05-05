/* jshint -W014 */

var docpadConfig = {
	templateData: {
		site: {
			url: 'http://definitelytyped.org',
			github: 'https://github.com/DefinitelyTyped/DefinitelyTyped',
			ref: 'github.com/DefinitelyTyped/DefinitelyTyped',
			home: '/',
			gh: {
				user: 'DefinitelyTyped',
				repo: 'DefinitelyTyped'
			},
			oldUrls: [],
			title: 'DefinitelyTyped',
			description: 'The repository for high quality TypeScript type definitions',
			tagline: 'The repository for high quality TypeScript type definitions',
			keywords: 'typescript, type, definition, declaration, repository, typing',
			styles: [
				'/styles/semantic.min.css',
				'/styles/highlight.css',
				'/styles/style.css'
			],
			scripts: [
				'//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js',
				'/scripts/semantic.min.js',
				'/scripts/script.js'
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
			typesearch: {
				web: 'https://microsoft.github.io/TypeSearch/'
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
			markedOptions: require('./lib/marked')
		}
	},
	events: {
	}
};

module.exports = docpadConfig;
