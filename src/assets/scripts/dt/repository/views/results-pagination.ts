namespace dt.repository
{
	/**
	 * Data structure representing a single item within the pagination.
	 */
	export interface PaginationItem
	{
		index:number;
		label:string;
		className:string;
	}



	/**
	 * Display the pagination for a result list.
	 */
	export class Pagination extends Backbone.NativeView<ViewState>
	{
		/**
		 * Template for a single pagination item.
		 * Retrieved in constructor of dt.repository.Component.
		 */
		itemTemplate:Function;



		/**
		 * Create a new Pagination instance.
		 */
		constructor(options?:Backbone.ViewOptions<ViewState>) {
			super(_.defaults(options || {}, {
				tagName: 'ul',
				className: 'dt-repository-search-pagination',
				events: {
					'click li': 'onItemClick',
				}
			}));

			this.listenTo(this.model, 'change:results', this.onResultsChanged);
			this.listenTo(this.model, 'change:resultsOffset', this.onResultsChanged);
		}


		/**
		 * Render the pagination with the current view state values.
		 */
		render():Pagination {
			var items = this.getItems();
			var html = '';
			for (var item of items) {
				html += this.itemTemplate(item);
			}

			this.el.innerHTML = html;
			toggleClass(this.el, 'empty', items.length == 0);

			return this;
		}


		/**
		 * Return the pagination items currently visible.
		 */
		private getItems():PaginationItem[] {
			var model  = this.model.attributes;
			if (model.resultsPages < 2) {
				return [];
			}

			var current = Math.floor(model.resultsOffset / model.resultsPerPage);
			var min = Math.max(0, current - 2);
			var max = Math.min(model.resultsPages - 1, min + 4);
			min     = Math.max(0, max - 4);

			return this.getItemsRange(current, min, max, model.resultsPages);
		}


		/**
		 * Return the pagination items within the given min/max values.
		 */
		private getItemsRange(current:number, min:number, max:number, count:number):PaginationItem[] {
			var result = [];

			if (current > 0) {
				result.push({
					index: current - 1,
					label: '&lt;',
					className: 'previous'
				});
			} else {
				result.push({
					label: '&lt;',
					className: 'previous disabled'
				});
			}

			for (var index = min; index <= max; index++) {
				result.push({
					index,
					label: index + 1,
					className: 'item' + (index == current ? ' current' : '')
				});
			}

			if (current < count - 1) {
				result.push({
					index: current + 1,
					label: '&gt;',
					className: 'next'
				});
			} else {
				result.push({
					label: '&gt;',
					className: 'next disabled'
				});
			}

			return result;
		}‚


		/**
		 * Triggered when the displayed results have changed.
		 */
		private onResultsChanged() {
			this.render();
		}


		/**
		 * Triggered when the user clicks on on of the pagination items.
		 */
		private onItemClick(e:MouseEvent) {
			var el = <HTMLElement>e.target;
			if (el.hasAttribute('data-index')) {
				var offset = parseInt(el.getAttribute('data-index'));
				offset *= this.model.attributes.resultsPerPage;

				this.model.set('resultsOffset', offset);
				preventDefault(e);
			}
		}
	}
}
