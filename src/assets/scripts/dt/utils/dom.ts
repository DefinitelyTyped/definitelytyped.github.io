namespace dt
{
	export function addEventListener(el, eventName:string, listener:Function) {
		if (el.addEventListener) {
			el.addEventListener(eventName, listener);
		} else {
			el.attachEvent('on' + eventName, listener);
		}
	}


	export function removeEventListener(el, eventName:string, listener:Function) {
		if (el.removeEventListener) {
			el.removeEventListener(eventName, listener);
		} else {
			el.detachEvent('on' + eventName, listener);
		}
	}


	export function removeClass(el:HTMLElement, className:string) {
		if (el.classList) {
			el.classList.remove(className);
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}


	export function addClass(el:HTMLElement, className:string) {
		if (el.classList) {
			el.classList.add(className);
		} else {
			if (!hasClass(el, className)) {
				el.className += ' ' + className;
			}
		}
	}


	export function hasClass(el:HTMLElement, className:string):boolean {
		if (el.classList) {
			return el.classList.contains(className);
		} else {
			return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
		}
	}


	export function toggleClass(el:HTMLElement, className:string, value:boolean = !hasClass(el, className)) {
		if (value) {
			addClass(el, className);
		} else {
			removeClass(el, className);
		}
	}


	export function preventDefault(event:any) {
		if (event && event.preventDefault) {
			event.preventDefault();
		} else if (window.event && window.event.returnValue) {
			window.event.returnValue = false;
		}
	}
}
