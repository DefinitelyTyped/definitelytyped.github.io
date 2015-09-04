namespace dt.repository
{
	/**
	 * Display the search results as a paginated list.
	 */
    export class Results extends Backbone.NativeView<ViewState>
    {
		/**
		 * The list subview.
		 */
		private list:List;

		/**
		 * The pagination subview.
		 */
		private pagination:Pagination;

		/**
		 * The current mode class set on the container.
		 */
		private mode:string = 'idle';



		/**
		 * Create a new Results instance.
		 */
        constructor(options?:Backbone.ViewOptions<ViewState>) {
			super(options);

			this.list = new List({
				el:    this.el.querySelector('ul.dt-repository-search-list'),
				model: this.model
			});

			this.pagination = new Pagination({
				el:    this.el.querySelector('ul.dt-repository-search-pagination'),
				model: this.model
			});

			this.listenTo(this.model, 'change:mode', this.onModeChanged);
        }


		/**
		 * Triggered when the mode of the view state has changed.
		 */
		private onModeChanged(state:ViewState, mode:ViewMode) {
			removeClass(this.el, this.mode);
			this.mode = ViewMode[mode].toLowerCase();
			addClass(this.el, this.mode);
		}
    }
}
