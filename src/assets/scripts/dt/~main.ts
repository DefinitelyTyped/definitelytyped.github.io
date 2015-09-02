namespace dt
{
	/**
	 * Main application of the DefinitelyTyped site.
	 *
	 * Currently does only start some components.
	 */
	export class Application
	{
		constructor() {
			if (console && console.log) {
				console.log('\n\nShow your stuff at https://github.com/DefinitelyTyped/definitelytyped.github.io\n\n');
			}

			_(document.querySelectorAll('.dt-repository-search')).each((el:any) => {
				new repository.Component({el});
			});

			_(document.querySelectorAll('.dt-header-stars')).each((el:any) => {
				new stars.Component({el});
			});
		}
	}


	/**
	 * Boot!
	 */
	export var app:Application = new Application();
}
