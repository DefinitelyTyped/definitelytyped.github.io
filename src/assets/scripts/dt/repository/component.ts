namespace dt.repository
{
	/**
	 * The root view of the repository component used on the front page.
	 *
	 * Consists of the search form and the result list, all views communicate
	 * through an ViewState instance.
	 */
    export class Component extends Backbone.NativeView<ViewState>
    {
		/**
		 * The search form subview.
		 */
        form:SearchForm;

		/**
		 * The result list subview.
		 */
		results:Results;



		/**
		 * Create a new repository Component.
		 */
        constructor(options?:Backbone.ViewOptions<ViewState>) {
            super(options);
            this.model = this.model || new ViewState();

			// Fetch the mandatory templates
			ListItem.prototype.compactTemplate = this.getTemplate('list-row-compact');
			ListItem.prototype.detailsTemplate = this.getTemplate('list-row-details');
			Pagination.prototype.itemTemplate  = this.getTemplate('pagination');

			// Setup subviews
            this.form = new SearchForm({
                el:    this.el.querySelector('.dt-repository-search-form'),
                model: this.model
            });

            this.results = new Results({
                el:    this.el.querySelector('.dt-repository-search-results'),
                model: this.model
            });
        }


		/**
		 * Return a names template. Templates should be script tags inside the
		 * components container with the templates name as class name.
		 */
		getTemplate(name:string):Function {
			var el = <HTMLScriptElement>this.el.querySelector('script.' + name);
			if (el) {
				return _.template(el.innerHTML);
			} else {
				return () => '';
			}
		}
    }
}
