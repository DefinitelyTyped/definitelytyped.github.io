/* jshint -W014 */

var docpadConfig = {
	templateData: {
		site: {
			url: 'http://definitelytyped.github.io',
			oldUrls: [],
			title: 'DefinitelyTyped',
			description: 'The repository for high quality TypeScript type definitions.',
			keywords: 'typescript, type, definition, declaration, repository, typing',
			styles: ['/vendor/normalize.css', '/vendor/h5bp.css', '/styles/style.css'],
			scripts: ['<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>'
				+ '<script>window.jQuery || document.write(\'<script src=\"/vendor/jquery.js\"><\\/script>\')</script>',
				'/vendor/log.js', '/vendor/modernizr.js', '/scripts/script.js']
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
		posts: function() {
			return this.getCollection('documents').findAllLive({
				relativeOutDirPath: 'posts'
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