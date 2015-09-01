namespace dt.repository
{
	/**
	 * The modes the repository search can be in.
	 */
    export enum ViewMode {
        Idle,
        Query,
        Loading,
        Empty,
        All
    }



	/**
	 * Model attributes of the ViewState class.
	 */
	export interface ViewStateAttributes
	{
		query?:string;
		mode?:ViewMode;
		results?:IRepositoryPackageData[];
		resultsCount?:number;
		resultsPages?:number;
		resultsOffset?:number;
		resultsPerPage?:number;
	}



	/**
	 * Constructor options of the ViewState class.
	 */
	export interface ViewStateOptions {
		repository:Repository;
	}



	/**
	 * A model describing the current state of the repository search.
	 */
	export class ViewState extends Backbone.Model
    {
		/**
		 * The actual values of this model.
		 */
		attributes:ViewStateAttributes;

		/**
		 * The repository instance used by this model to retrieve package data.
		 */
        private repository:Repository;



		/**
		 * Create a new VieState instance.
		 */
        constructor(attributes?:any, options?:ViewStateOptions) {
            super(attributes, options);

            if (options && options.repository) {
                this.repository = options.repository;
            } else {
                this.repository = new Repository();
            }
        }


		/**
		 * Return the default attributes of a ViewState.
		 */
        defaults():ViewStateAttributes {
            return {
                query:           '',
                mode: ViewMode.Idle,
                results:         [],
                resultsCount:     0,
                resultsPages:     0,
                resultsOffset:    0,
                resultsPerPage:  10
            };
        }


		/**
		 * Reset the state, empties the query and removes all visible packages.
		 */
		idle() {
			this.set('mode', ViewMode.Idle);
			this.set('query', '');
			this.setResults([]);
		}


		/**
		 * Make the view show all packages.
		 */
		all() {
			if (this.attributes.mode == ViewMode.All) return;
			this.set('query', '');

			if (!this.repository.isLoaded()) {
				this.set('mode', ViewMode.Loading);
			}

			this.repository.require((data) => {
				if (this.attributes.query != '') return;
				this.set('mode', ViewMode.All);
				this.setResults(data.content);
			});
		}


		/**
		 * Make the view only show packages matching the given query.
		 */
        query(value:string) {
            value = value.replace(/^\s+|\s+$/g, '');
            if (this.attributes.query == value) return;
            this.set('query', value);

            if (value == '') {
                this.idle();
            } else {
				if (!this.repository.isLoaded()) {
					this.set('mode', ViewMode.Loading);
				}

                this.repository.query(value, (results) => {
                    if (this.attributes.query != value) return;
					this.set('mode', results.length ? ViewMode.Query : ViewMode.Empty);
					this.setResults(results);
                });
            }
        }


		/**
		 * Return all results of the current view state.
		 */
        getResults():IRepositoryPackageData[] {
            return this.get('results');
        }


		/**
		 * Return the visible/paginates results.
		 */
        getVisibleResults():IRepositoryPackageData[] {
            var results = this.getResults();
            var start = this.get('resultsOffset');
            var end = Math.min(start + this.get('resultsPerPage'), this.get('resultsCount'));

            return results.slice(start, end);
        }


		/**
		 * Set the displayed packages.
		 */
		private setResults(value:IRepositoryPackageData[]) {
			if (!_.isArray(value)) value = [];
			var count = value.length;
			var resultsPerPage = this.attributes.resultsPerPage;

			this.set({
				results:       value,
				resultsCount:  count,
				resultsPages:  Math.ceil(count / resultsPerPage),
				resultsOffset: 0
			});
		}
	}
}
