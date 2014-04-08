# The DocPad Configuration File
# It is simply a CoffeeScript Object which is parsed by CSON
docpadConfig = {

	# =================================
	# Template Data

	templateData:

		site:
			url: "http://definitelytyped.github.io"

			oldUrls: [
			]

			title: "DefinitelyTyped"

			description: """
				The repository for high quality TypeScript type definitions.
				"""

			keywords: """
				typescript, type, definition, declaration, repository, typing
				"""

			styles: [
				'/vendor/normalize.css'
				'/vendor/h5bp.css'
				'/styles/style.css'
			]

			scripts: [
				"""
				<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
				<script>window.jQuery || document.write('<script src="/vendor/jquery.js"><\\/script>')</script>
				"""

				'/vendor/log.js'
				'/vendor/modernizr.js'
				'/scripts/script.js'
			]


		# -----------------------------
		# Helper Functions

		getPreparedTitle: ->
			# if we have a document title, then we should use that and suffix the site's title onto it
			if @document.title
				"#{@document.title} | #{@site.title}"
			# if our document does not have it's own title, then we should just use the site's title
			else
				@site.title

		# Get the prepared site/document description
		getPreparedDescription: ->
			# if we have a document description, then we should use that, otherwise use the site's description
			@document.description or @site.description

		# Get the prepared site/document keywords
		getPreparedKeywords: ->
			# Merge the document keywords with the site keywords
			@site.keywords.concat(@document.keywords or []).join(', ')


	# =================================
	# Collections

	collections:

		# Create a collection called posts
		# That contains all the documents that will be going to the out path posts
		posts: ->
			@getCollection('documents').findAllLive({relativeOutDirPath: 'posts'})


	# =================================
	# Environments

	environments:
		development:
			templateData:
				site:
					url: false

	plugins:
		handlebars:
			helpers:
				getBlock: (type, additional...) ->
					additional.pop() # remove the hash object
					@getBlock(type).add(additional).toHTML()
			partials:
				title: '<h1>{{document.title}}</h1>'
				goUp: '<a href="#">Scroll up</a>'

	# =================================
	# DocPad Events

	events:

		# Server Extend
		# Used to add our own custom routes to the server before the docpad routes are added
		serverExtend: (opts) ->
			# Extract the server from the options
			{server} = opts
			docpad = @docpad

			# As we are now running in an event,
			# ensure we are using the latest copy of the docpad configuraiton
			# and fetch our urls from it
			latestConfig = docpad.getConfig()
			oldUrls = latestConfig.templateData.site.oldUrls or []
			newUrl = latestConfig.templateData.site.url

			# Redirect any requests accessing one of our sites oldUrls to the new site url
			server.use (req,res,next) ->
				if req.headers.host in oldUrls
					res.redirect(newUrl+req.url, 301)
				else
					next()
}

# Export our DocPad Configuration
module.exports = docpadConfig