namespace dt
{
	/**
	 * Vendor prefixed name of the transition style property.
	 */
	export var transitionStyle:string;

	/**
	 * Vendor prefixed name of the transition end event.
	 */
	export var transitionEndEvent:string;

	/**
	 * Temporary div for testing style and avent names.
	 */
	var el:HTMLDivElement;

	/**
	 * List of known vendor prefixes.
	 */
	var prefixes = ['MS', 'webkit', 'moz', 'o'];


	/**
	 * Run the given callback with a dummy element available.
	 */
	export function withDummyElement<T>(callback:{(el:HTMLDivElement):T}):T {
		if (el) {
			return callback(el);
		} else {
			el = document.createElement('div');
			document.body.insertBefore(el, null);

			var result = callback(el);

			document.body.removeChild(el);
			el = void 0;
			return result;
		}
	}


	/**
	 * Return the prefixed style name of the given style name.
	 */
	export function getPrefixedStyle(name:string):string {
		return withDummyElement((el) => {
			if (name in el.style) return name;

			name = name.substr(0, 1).toUpperCase() + name.substr(1);
			for (var prefix of prefixes) {
				var prefixed = prefix + name;
				if (prefixed in el.style) return prefixed;
			}

			return null;
		});
	}


	/**
	 * Return the prefixed event name of the given event name.
	 */
	export function getPrefixedEvent(name:string):string {
		return withDummyElement((el) => {
			var lcName = name.toLowerCase();
			if ('on' + name in el) return name;
			if ('on' + lcName in el) return lcName;

			for (var prefix of prefixes) {
				if ('on' + prefix + name in el) return prefix + name;
				if ('on' + prefix.toLowerCase() + lcName in el) return prefix.toLowerCase() + lcName;
			}

			return null;
		});
	}


	/**
	 * Find the required prefixed names.
	 */
	withDummyElement(function() {
		transitionStyle = getPrefixedStyle('transition');
		transitionEndEvent = getPrefixedEvent('TransitionEnd');
	});
}
