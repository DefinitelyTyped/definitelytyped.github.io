namespace dt
{
	/**
	 * The version of the internet explorer or FALSE.
	 *
	 * From http://codepen.io/gapcode/pen/vEJNZN
	 */
	export var ieVersion = (function():any {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}

		var trident = ua.indexOf('Trident/');
		if (trident > 0) {
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}

		var edge = ua.indexOf('Edge/');
		if (edge > 0) {
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}

		return false;
	})();


	// Add a helper class to the html element
	toggleClass(document.documentElement, 'is-ie', !!ieVersion);
}
