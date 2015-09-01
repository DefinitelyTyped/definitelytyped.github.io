namespace dt.repository
{
	/**
	 * Displays the repository search form on the front page.
	 */
    export class SearchForm extends Backbone.NativeView<ViewState>
    {
		/**
		 * The search field subview.
		 */
        private sword:SwordField;



		/**
		 * Create a new instance of the search form.
		 */
		constructor(options?:Backbone.ViewOptions<ViewState>) {
			super(options);

			this.delegateEvents({
				'submit': (e) => preventDefault(e),
				'click .all': 'onAllClick'
			});

            this.sword = new SwordField({
                el: this.el.querySelector('dl.sword'),
                model: this.model
            });
        }


		/**
		 * Triggered when the user hits the "All" button.
		 */
		private onAllClick(e:MouseEvent) {
			preventDefault(e);
			this.model.all();
		}
    }



	/**
	 * Displays the input field for the search keyword.
	 */
    class SwordField extends Backbone.NativeView<ViewState>
    {
		/**
		 * The input field for the search keyword.
		 */
        private input:HTMLInputElement;

		/**
		 * Checked while coommiting to prevent looped commits.
		 */
		private isCommiting:boolean;



		/**
		 * Create a new SwordField instance.
		 * @param options
		 */
        constructor(options?:Backbone.ViewOptions<ViewState>) {
			super(options);

			// Bind input events directly, they don't bubble
            this.input = this.el.querySelector('input');
			addEventListener(this.input, 'input', () => this.onInputChanged());
			addEventListener(this.input, 'change', () => this.onInputChanged());
			addEventListener(this.input, 'keydown', (e) => this.onInputKeyDown(e));

			this.listenTo(this.model, 'change:query', this.onQueryChanged);
			this.delegateEvents({
				'click button': 'onButtonClick'
			});

			// On browser back we might already have a value
			if (this.input.value != '') {
				_.defer(() => this.commit());
			}
        }


		/**
		 * Send the input value to the view state.
		 */
		private commit() {
			if (this.isCommiting) return;
			this.isCommiting = true;

			var value = this.input.value;
			toggleClass(this.el, 'has-sword', value != '');
			this.model.query(value);

			this.isCommiting = false;
		}


		/**
		 * Triggered when the query string of the view state has changed.
		 */
		private onQueryChanged(state:ViewState, query:string) {
			if (!this.isCommiting) {
				toggleClass(this.el, 'has-sword', query != '');
				this.input.value = query;
			}
		}


        /**
         * Triggered when the value of the input field has been changed.
         */
        private onInputChanged() {
			this.commit();
        }


		/**
		 * Triggered after a key has been released.
		 */
		private onInputKeyDown(e) {
			if (e.keyCode == 13) {
				this.commit();
			} else if (e.keyCode == 27) {
				this.model.idle();
			}
		}


		/**
		 * Triggered when the button is clicked.
		 */
        private onButtonClick(e:MouseEvent) {
			preventDefault(e);
			this.model.idle();
        }
    }
}
