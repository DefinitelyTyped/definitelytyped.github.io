namespace dt.repository
{
	/**
	 * The root data structure of the loaded repository data.
	 */
	export interface IRepositoryData
	{
		repo:string;
		ref:string;
		urls:{def:string;};
		updatedAt:number;
		count:number;
		content:IRepositoryPackageData[];
	}



	/**
     * The data structure of a single package information.
     */
    export interface IRepositoryPackageData
    {
        id:number;
        project:string;
        name:string;
        sword:string;
        score:number;
        path:string;
		references?:IRepositoryPackageReference;
		download?:string;
		github?:string;
		nuget?:string;
        info:{
            references:string[];
            name:string;
            version:string;
            description:string;
            projectUrl:string;
            authors:{name:string;url:string;}[];
			reposUrl:string;
        };
    }



	/**
	 * Data structure of resolved references.
	 */
	export interface IRepositoryPackageReference
	{
		location:string;
		name?:string;
		download?:string;
	}



	/**
	 * State enumeration the repository can be in.
	 */
    export const enum RepositoryState {
        Idle,
        Loading,
        Ready,
        Unavailable
    }



    /**
     * A class that manages loading and querying data of the repository.
     */
    export class Repository extends Backbone.Model
    {
		/**
		 * The url of the json feed this repository loads.
		 */
        private jsonUrl:string;

		/**
		 * The current state of the repository.
		 */
		private state:RepositoryState;

		/**
		 * The loaded data structure.
		 */
		private data:IRepositoryData;



		/**
		 * Create a new Repository instance.
		 */
        constructor(jsonUrl:string = '/tsd/data/repository.json') {
            super();

            this.jsonUrl = jsonUrl;
            this.state = RepositoryState.Idle;
            this.load();
        }


		/**
		 * Test whether this repository has finished loading.
		 */
		isLoaded():boolean {
			return this.state == RepositoryState.Ready;
		}


		/**
		 * Load the data of this repository.
		 */
        load() {
            if (this.state != RepositoryState.Idle) return;
            this.setState(RepositoryState.Loading);

            var request = new XMLHttpRequest();
            request.onreadystatechange = () => {
                if (request.readyState === 4) {
                    if (request.status >= 200 && request.status < 400) {
                        this.setData(request.responseText);
                        this.setState(RepositoryState.Ready);
                    } else {
                        this.setState(RepositoryState.Unavailable);
                    }
                }
            };

            request.open('GET', this.jsonUrl, true);
            request.send();
        }


		/**
		 * Call the given function after the repository has been loaded.
		 */
        require(callback:{(data:IRepositoryData);}) {
            if (this.data) {
                callback(this.data);
            } else {
                this.once('loaded', callback);
                this.load();
            }
        }


		/**
		 * Query the repository for the given keyword and call the callback with the results.
		 */
        query(sword:string, callback:{(packages:IRepositoryPackageData[]);}) {
            this.require((data:IRepositoryData) => {
                var swords = sword.toLowerCase().split(/\s+/);
				var count = swords.length;

                callback(_(data.content).filter((content) => {
					var score = 0;
					for (var index = 0; index < count; index++) {
						var sword = swords[index];
						var offset = content.name.indexOf(sword);

						if (offset != -1) {
							if (count == 1) {
								score += (content.name == sword ? 9 : (offset == 0 ? 2 : 1));
							} else {
								score += offset == 0 ? 2 : 1;
							}
						} else {
							score -= 1;
						}
					}

					content.score = score / count;
                    return content.score >= 1;
                }).sort((a, b) => {
                    if (a.score == b.score) {
                        if (a.name == b.name) return 0;
                        return a.sword > b.sword ? 1 : -1;
                    } else {
                        return a.score < b.score ? 1 : -1;
                    }
                }));
            });
        }


		/**
		 * Set the state the repository is in.
		 */
        private setState(value:RepositoryState) {
			this.set('state', value);
        }


		/**
		 * Parse and set the repository data from a json string.
		 */
        private setData(json:string) {
            var data = <IRepositoryData>JSON.parse(json);

			var paths = {};
			_(data.content).forEach((content, id) => {
				paths[content.path] = id;

				content.id       = id;
				content.sword    = content.name.toLowerCase();
				content.download = content.info.reposUrl + '/raw/master/' + content.path;
				content.github   = content.info.reposUrl + '/tree/master/' + content.project;
				content.nuget    = 'http://www.nuget.org/packages/' + content.project + '.TypeScript.DefinitelyTyped/';
			});

            _(data.content).forEach((content, id) => {
				content.references = _(content.info.references).map((path:string) => {
					var result:IRepositoryPackageReference = { location: path };

					if (path.substr(0, 3) == '../') {
						path = path.substr(3);
					}

					if (path in paths) {
						var reference = data.content[paths[path]];
						result.name = reference.name;
						result.download = reference.download;
					}

					return result;
				});
            });



            data.content.sort((a, b) => a.sword == b.sword ? 0 : (a.sword > b.sword ? 1 : -1));

            this.data = data;
            this.trigger('loaded', data);
        }
    }
}
