namespace dt
{
	/**
	 * Run the given callback with deactivated transitions on the given element.
	 */
    export function noTransition(el:HTMLElement, callback:Function) {
		if (!transitionStyle) return callback();

		addClass(el, 'no-transition');
        callback();
        el.getBoundingClientRect();
		removeClass(el, 'no-transition');
    }


	/**
	 * Create a height transition for the given element.
	 */
    export function transitionHeight(el:HTMLElement, callback:Function, success?:Function) {
		if (!transitionStyle) {
			callback();
			if (success) success();
			return;
		}

		var hasTransition;
        var from = el.offsetHeight;
		var to = 0;

        noTransition(el, function () {
			el.style.height = null;
            callback();
            to = el.offsetHeight;

            if (from != to) {
                el.style.height = from + 'px';
				hasTransition = true;
            }
        });

        if (hasTransition) {
			var listener = function() {
				removeEventListener(el, transitionEndEvent, listener);
				noTransition(el, () => el.style.height = null);
				if (success) success();
			};

			addEventListener(el, transitionEndEvent, listener);
			el.style.height = to + 'px';
        }
    }
}
