namespace dt.menu
{
	/**
	 * Menu helper for mobile expanding/collapsing of the menu.
	 */
	export class Component extends Backbone.NativeView<any>
	{
		/**
		 * Class name of the current transition.
		 */
		private transition:string;

		/**
		 * Timeout of the current transition.
		 */
		private transitionTimeout:number;

		/**
		 * Is the menu currently expanded?
		 */
		isExpanded:boolean = false;



		/**
		 * Create a new menu Component instance.
		 */
		constructor(options?:Backbone.ViewOptions<any>) {
			super(_.defaults(options || {}, {
				events: {
					'click .menu-widget': 'onWidgetClick'
				}
			}));
		}


		/**
		 * Set a transition class on this row.
		 */
		private setTransition(transition:string, duration:number = 400) {
			if (this.transition == transition) return;
			if (this.transition) {
				clearTimeout(this.transitionTimeout);
				removeClass(this.el, this.transition);
			}

			addClass(this.el, transition);

			this.transition = transition;
			this.transitionTimeout = setTimeout(() => {
				removeClass(this.el, transition);
				this.transition = this.transitionTimeout = null;
			}, duration);
		}


		/**
		 * Triggered when the user clicks onto a menu widget.
		 */
		onWidgetClick() {
			this.isExpanded = !this.isExpanded;
			toggleClass(document.documentElement, 'has-menu', this.isExpanded);

			if (this.isExpanded) {
				this.setTransition('menu-fade-in', 750);
			} else {
				this.setTransition('menu-fade-out', 250);
			}
		}
	}
}
