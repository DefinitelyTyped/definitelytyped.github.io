/* jshint -W014 */


var hljs;
function highlightCode(code, lang) {
	if (!hljs) {
		hljs = require('highlight.js');
		hljs.configure({tabReplace: '    '}); // 4 spaces
		hljs.registerLanguage('typescript', require('./lib/highlight/typescript'));
	}
	if (lang) {
		return hljs.highlight(lang, code).value;
	}
	return hljs.highlightAuto(code).value;
}

var docpadConfig = {
	templateData: {
		site: {
			url: 'http://definitelytyped.github.io',
			github: 'https://github.com/borisyankov/DefinitelyTyped',
			ref: 'github.com/borisyankov/DefinitelyTyped',
			home: '/',
			gh: {
				user: 'borisyankov',
				repo: 'DefinitelyTyped'
			},
			oldUrls: [],
			title: 'DefinitelyTyped',
			description: 'The repository for high quality TypeScript type definitions.',
			tagline: 'The repository for high quality TypeScript type definitions.',
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
				site: 'definitelytyped.github.io'
			}
		},
		link: {
			tsd: {
				web: 'http://www.tsdpm.com',
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
		}
	},
	collections: {
		guides: function() {
			return this.getCollection('documents').findAllLive({
				relativeOutDirPath: 'guides'
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
			markedOptions: {
				gfm: true,
				highlight: highlightCode
			}
		}
	},
	events: {
		serverExtend: function(opts) {
			var server = opts.server;
			var docpad = this.docpad;
			var latestConfig = docpad.getConfig();
			var oldUrls = latestConfig.templateData.site.oldUrls || [];
			var newUrl = latestConfig.templateData.site.url;
			return server.use(function(req, res, next) {
				if (oldUrls.indexOf(req.headers.host) >= 0) {
					return res.redirect(newUrl + req.url, 301);
				} else {
					return next();
				}
			});
		}
	}
};

module.exports = docpadConfig;
