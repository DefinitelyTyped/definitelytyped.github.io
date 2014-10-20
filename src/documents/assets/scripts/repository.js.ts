/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/underscore.d.ts" />

module dt
{
    function getVendorInfo(tuples) {
        for (var name in tuples) {
            if (!tuples.hasOwnProperty(name))
                continue;
            if (typeof (document.body.style[name]) !== 'undefined') {
                return { name: name, endEvent: tuples[name] };
            }
        }
        return null;
    }

    var transition = getVendorInfo({
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'msTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    });


    function noTransition($el:JQuery, callback:Function) {
        $el.addClass('no-transition');
        callback();
        $el.offset();
        $el.removeClass('no-transition');
    }


    function animateHeight($el:JQuery, callback:Function, success:Function) {
        var from = $el.height(), to = 0;
        noTransition($el, function () {
            callback();
            $el.css('height', '');
            to = $el.height();
            if (from != to && transition) {
                $el.css('height', from);
            }
        });

        if (from != to && transition) {
            $el.css('height', to);
            $el.on(transition.endEvent, function () {
                noTransition($el, () => {
                    $el.off(transition.endEvent).css('height', '');
                    if (success) {
                        success();
                    }
                });
            });
        }
    }


    /**
     * The data structure of a single package information.
     */
    interface IRepositoryPackageData
    {
        id:number;
        project:string;
        name:string;
        sword:string;
        score:number;
        path:string;
        reposUrl:string;
        info:{
            references:string[];
            name:string;
            version:string;
            description:string;
            projectUrl:string;
            authors:{name:string;url:string;}[];
        };
    }


    /**
     * The root data structure of the loaded repository data.
     */
    interface IRepositoryData
    {
        repo:string;
        ref:string;
        urls:{def:string;};
        updatedAt:number;
        count:number;
        content:IRepositoryPackageData[];
    }


    /**
     * A class that manages loading and querying data of the repository.
     */
    class Repository
    {
        url:string;

        data:IRepositoryData;

        request:JQueryPromise;


        constructor(url:string) {
            this.url = url;
        }

        load() {
            if (this.request || this.data) return;

            this.request = $.ajax({
                dataType: 'json',
                url: this.url
            }).then((data:IRepositoryData) => {
                _(data.content).forEach((content, id) => {
                    content.id = id;
                    content.sword = content.name.toLowerCase();
                });
                data.content.sort((a, b) => a.sword == b.sword ? 0 : (a.sword > b.sword ? 1 : -1));
                this.data = data;
                this.request = null;
                return data;
            });
        }

        require(callback:{(data:IRepositoryData);}) {
            if (this.data) {
                callback(this.data);
            } else {
                this.load();
                this.request.done(callback);
            }
        }

        query(sword:string, callback:{(packages:IRepositoryPackageData[]);}) {
            this.require((data:IRepositoryData) => {
                sword = sword.toLowerCase();
                callback(_(data.content).filter((content:IRepositoryPackageData) => {
                    var n = content.name.indexOf(sword);
                    content.score = (content.name == sword ? -1 : (n == 0 ? 0 : 1));
                    return n != -1;
                }).sort((a, b) => {
                    if (a.score == b.score) {
                        if (a.name == b.name) return 0;
                        return a.sword > b.sword ? 1 : -1;
                    } else {
                        return a.score > b.score ? 1 : -1;
                    }
                }));
            });
        }
    }


    class View
    {
        el:HTMLElement;

        $el:JQuery;

        constructor(html:string);
        constructor(el:HTMLElement);
        constructor($el:JQuery);
        constructor() {
            var arg = arguments[0];
            if (typeof arg == 'string') {
                this.$el = $(arg);
                this.el = this.$el.get(0);
            } else if (arg instanceof $) {
                this.$el = arg;
                this.el = arg.get(0);
            } else if (arg) {
                this.el = arg;
                this.$el = $(arg);
            }

            this.initialize();
        }

        initialize() {

        }

        remove() {
            this.$el.remove();
            this.$el = this.el = null;
        }

        $(selector:string):JQuery {
            return this.$el.find(selector);
        }
    }

    class RepositoryListItem extends View
    {
        constructor(data:IRepositoryPackageData) {
            super('');
        }
    }

    class RepositoryList extends View
    {
        $rows:JQuery;

        rows:{[id:number]:JQuery;} = <any>{};

        $pagination:JQuery;

        rowTemplate:Function;

        detailsTemplate:Function;

        paginationTemplate:Function;

        list:IRepositoryPackageData[];

        count:number = 0;

        offset:number = 0;

        numPages:number = 0;

        itemsPerPage:number = 10;


        initialize() {
            this.rowTemplate = _.template(this.$('script.list-row').html());
            this.detailsTemplate = _.template(this.$('script.list-details').html());
            this.paginationTemplate = _.template(this.$('script.pagination').html());

            this.$rows = this.$('ul.list-rows').appendTo(this.el);
            this.$pagination = this.$('ul.list-pagination').appendTo(this.el);

            this.$el.on('click', '.list-pagination a', (e:JQueryMouseEventObject) => {
                this.setPage(parseInt($(e.target).attr('data-page')));
                e.preventDefault();
            }).on('click', '.header', (e:JQueryMouseEventObject) => {
                var el = e.target;
                while (el.parentNode) {
                    if (el.tagName == 'A') return;
                    el = el.parentNode;
                }
                this.setExpanded($(e.target));
                e.preventDefault();
            }).on('click', '.expand', (e:JQueryMouseEventObject) => {
                this.setExpanded($(e.target), true);
                e.preventDefault();
            });
        }

        setList(list:IRepositoryPackageData[]) {
            this.list     = list;
            this.offset   = 0;
            this.count    = this.list.length;
            this.numPages = Math.ceil(this.count / this.itemsPerPage);

            this.renderList();
            this.renderPagination();
        }

        setPage(value:number) {
            value = Math.max(0, Math.min(this.numPages, value));
            this.offset = value * this.itemsPerPage;

            this.renderList();
            this.renderPagination();
        }

        setExpanded($el:JQuery, expand:bool = false) {
            var $item = $el.parents('li');
            animateHeight($item, () => {
                if (!$item.hasClass('expanded')) {
                    $item.addClass('expanded').addClass('expanding');
                    if ($item.find('.details').length == 0) {
                        var id = parseInt($item.attr('data-repository-id'));
                        var content = _(this.list).findWhere({id:id});
                        if (content) {
                            $item.append(this.detailsTemplate(content));
                        }
                    }
                } else {
                    if (expand) return;
                    $item.removeClass('expanded').addClass('collapsing');
                }
            }, () => {
                $item.removeClass('expanding collapsing');
            });
        }

        renderList() {
            this.$el.toggleClass('empty', this.count == 0);
            this.$rows.empty();
            if (this.count == 0) return;

            var rows = {};
            var min = this.offset;
            var max = Math.min(this.count, min + this.itemsPerPage);
            for (var index = min; index < max; index++) {
                var data = this.list[index];
                var $row = this.rows[data.id];

                if ($row) {
                    this.rows[data.id] = null;
                } else {
                    $row = $(this.rowTemplate(this.list[index]));
                }

                rows[data.id] = $row;
                this.$rows.append($row);
            }

            _(this.rows).each(($row) => $row ? $row.remove() : null);
            this.rows = <any>rows;
        }

        renderPagination() {
            var mid = Math.floor(this.offset / this.itemsPerPage);
            var min = Math.max(0, mid - 3);
            var max = Math.min(this.numPages - 1, min + 6);
            min = Math.max(0, max - 6);

            this.$pagination
                .empty()
                .toggleClass('empty', this.numPages < 2);

            if (mid > 0) {
                this.$pagination.append(this.paginationTemplate({index:mid - 1, display:'&lt;'}));
            }

            for (var index = min; index <= max; index++) {
                var $el = $(this.paginationTemplate({index:index, display:index + 1}));
                if (index == mid) $el.addClass('current');
                this.$pagination.append($el);
            }

            if (mid < this.numPages - 1) {
                this.$pagination.append(this.paginationTemplate({index:mid + 1, display:'&gt;'}));
            }
        }
    }


    class RepositorySearch extends View
    {
        repository:Repository;

        list:RepositoryList;


        constructor(el:HTMLElement, repository:Repository) {
            super(el);
            this.repository = repository;
            this.list = new RepositoryList(this.$('.list'));

            var $query = this.$('.query');
            this.$el.on('input', '.query', (event) => {
                var value = $.trim($query.val());
                if (value == '') {
                    this.list.setList([]);
                    this.$el.removeClass('has-sword');
                } else {
                    this.$el.addClass('has-sword');
                    this.repository.query(value, (result) => {
                        this.list.setList(result);
                    });
                }
            }).on('click', '.search', (e:JQueryMouseEventObject) => {
                e.preventDefault();
                if ($query.val() != '') {
                    $query.val('').focus();
                    this.$el.removeClass('has-sword');
                    this.list.setList([]);
                } else {
                    $query.focus();
                }
            }).on('click', '.all', (e:JQueryMouseEventObject) => {
                e.preventDefault();
                this.repository.require((data) => {
                    $query.val('');
                    this.$el.removeClass('has-sword');
                    this.list.setList(data.content);
                });
            });
        }
    }


    /**
     * Bootstrap
     */
    $(() => {
        if (console && console.log) {
            console.log('\n\nShow your stuff at https://github.com/DefinitelyTyped/definitelytyped.github.io\n\n');
        }

        var repository = new Repository('/tsd/data/repository.json');
        $('.dt-repository-search').each((n, el) => {
            new RepositorySearch(<HTMLElement>el, repository);
        })
    });
}