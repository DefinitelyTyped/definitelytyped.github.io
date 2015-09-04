namespace dt.repository
{
	/**
	 * Display the visible part of the result list.
	 */
	export class List extends Backbone.NativeView<ViewState>
	{
		/**
		 * List of visible rows.
		 */
		private items:ListItem[];



		/**
		 * Create a new List instance.
		 */
		constructor(options?:Backbone.ViewOptions<ViewState>) {
			super(_.defaults(options || {}, {
				tagName: 'ul',
				className: 'dt-repository-search-list'
			}));

			this.listenTo(this.model, 'change:results', this.onResultsChanged);
			this.listenTo(this.model, 'change:resultsOffset', this.onResultsChanged);
		}


		/**
		 * Triggered when the result set or the offset changes.
		 */
		private onResultsChanged(state:ViewState) {
			_(this.items).each((item) => item.remove());
			this.items = [];

			_(state.getVisibleResults()).each((result) => {
				var item = new ListItem({model: result});
				this.items.push(item);
				this.el.appendChild(item.el);
			});

			if (this.items.length > 0) {
				this.el.classList ? this.el.classList.remove('empty') : this.el.className;
			} else {

			}
		}
	}



	/**
	 * Display a single result within the result list.
	 */
	export class ListItem extends Backbone.NativeView<any>
	{
		/**
		 * Template for the compact row view.
		 * Retrieved in constructor of dt.repository.Component.
		 */
		compactTemplate:Function;

		/**
		 * Template for the detail panel.
		 * Retrieved in constructor of dt.repository.Component.
		 */
		detailsTemplate:Function;

		/**
		 * Class name of the current transition.
		 */
		private transition:string;

		/**
		 * Timeout of the current transition.
		 */
		private transitionTimeout:number;

		/**
		 * Is this row expanded?
		 */
		private isExpanded:boolean;

		/**
		 * Did we already create the detail view?
		 */
		private isDetailCreated:boolean;



		/**
		 * Create a new ListItem instance.
		 */
		constructor(options?:Backbone.ViewOptions<any>) {
			super(_.defaults(options || {}, {
				tagName: 'li',
				className: 'list-item',
				attributes: {
					tabindex: 0
				},
				events: {
					'click .header': 'onHeaderClick',
					'keydown': 'onKeyDown'
				}
			}));

			this.el.innerHTML = this.compactTemplate(this.model);
		}


		/**
		 * Set the expanded state of this row.
		 */
		setExpanded(value:boolean) {
			if (this.isExpanded == value) return;
			this.isExpanded = value;

			var transition;
			if (value) {
				this.createDetails();
				transition = 'expanding';
			} else {
				transition = 'collapsing';
			}

			transitionHeight(this.el, () => {
				toggleClass(this.el, 'expanded', value);
			});

			this.setTransition(transition);
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
		 * Create the details view of this row.
		 */
		private createDetails() {
			if (this.isDetailCreated) return;
			this.isDetailCreated = true;

			var details = document.createElement('div');
			details.innerHTML = this.detailsTemplate(this.model);

			while (details.firstChild) {
				this.el.appendChild(details.firstChild);
			}
		}


		/**
		 * Triggered when the user clicks on the title of the row.
		 */
		private onHeaderClick(e:MouseEvent) {
			var el = <HTMLElement>(e.target || e.srcElement);
			if (el && el.tagName == 'A') return;

			preventDefault(e);
			this.setExpanded(!this.isExpanded);
			this.el.blur();
		}


		/**
		 * Triggered when a key has been pressed above the element.
		 */
		private onKeyDown(e:KeyboardEvent) {
			if (e.srcElement != this.el) return;
			if (e.keyCode == 13) {
				this.setExpanded(!this.isExpanded);
			}
		}
	}
}
