namespace dt.menu
{
	enum MenuState
	{
		Top,
		Sticky,
		Bottom
	}


	/**
	 * Sticky menu helper.
	 */
	export class Component extends Backbone.NativeView<any>
	{
		private min:number;

		private max:number;

		private state:MenuState = MenuState.Top;



		/**
		 * Create a new menu Component instance.
		 */
		constructor(options?:Backbone.ViewOptions<any>) {
			super(options);

			if (hasPositionSticky) {
				addClass(document.body, 'has-sticky');
				return;
			}

			addEventListener(window, 'scroll', () => this.onScroll());
			addEventListener(window, 'resize', () => this.onResize());

			FontFaceOnload('Open Sans', { success: () => this.onResize() });
			FontFaceOnload('Raleway', { success: () => this.onResize() });

			this.onResize();
		}


		/**
		 * Set the sticky state of this menu.
		 */
		setState(value:MenuState) {
			if (this.state == value) return;

			removeClass(this.el, MenuState[this.state].toLowerCase());
			this.state = value;
			addClass(this.el, MenuState[this.state].toLowerCase());
		}


		/**
		 * Triggered when the user scrolls the document.
		 */
		private onScroll() {
			var at = scrollTop();

			if (at < this.min) {
				this.setState(MenuState.Top);
			} else if (at > this.max) {
				this.setState(MenuState.Bottom);
			} else {
				this.setState(MenuState.Sticky);
			}
		}


		/**
		 * Triggered when the window has been resized.
		 */
		private onResize() {
			var el = <HTMLElement>(this.el.parentNode);
			this.min = el.getBoundingClientRect().top + scrollTop() - 40;

			var el = <HTMLElement>(el.parentNode);
			this.max = this.min + el.offsetHeight - this.el.offsetHeight + 4;

			this.onScroll();
		}
	}
}
