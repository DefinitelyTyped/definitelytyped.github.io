/// <reference path="lib/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var dt;
(function (dt) {
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
    function noTransition($el, callback) {
        $el.addClass('no-transition');
        callback();
        $el.offset();
        $el.removeClass('no-transition');
    }
    function animateHeight($el, callback, success) {
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
                noTransition($el, function () {
                    $el.off(transition.endEvent).css('height', '');
                    if (success) {
                        success();
                    }
                });
            });
        }
    }
    var Repository = (function () {
        function Repository(url) {
            this.url = url;
        }
        Repository.prototype.load = function () {
            var _this = this;
            if (this.request || this.data)
                return;
            this.request = $.ajax({
                dataType: 'json',
                url: this.url
            }).then(function (data) {
                _(data.content).forEach(function (content, id) {
                    content.id = id;
                    content.sword = content.name.toLowerCase();
                });
                data.content.sort(function (a, b) { return a.sword == b.sword ? 0 : (a.sword > b.sword ? 1 : -1); });
                _this.data = data;
                _this.request = null;
                return data;
            });
        };
        Repository.prototype.require = function (callback) {
            if (this.data) {
                callback(this.data);
            }
            else {
                this.load();
                this.request.done(callback);
            }
        };
        Repository.prototype.query = function (sword, callback) {
            this.require(function (data) {
                sword = sword.toLowerCase();
                callback(_(data.content).filter(function (content) {
                    var n = content.name.indexOf(sword);
                    content.score = (content.name == sword ? -1 : (n == 0 ? 0 : 1));
                    return n != -1;
                }).sort(function (a, b) {
                    if (a.score == b.score) {
                        if (a.name == b.name)
                            return 0;
                        return a.sword > b.sword ? 1 : -1;
                    }
                    else {
                        return a.score > b.score ? 1 : -1;
                    }
                }));
            });
        };
        return Repository;
    })();
    var View = (function () {
        function View() {
            var arg = arguments[0];
            if (typeof arg == 'string') {
                this.$el = $(arg);
                this.el = this.$el.get(0);
            }
            else if (arg instanceof $) {
                this.$el = arg;
                this.el = arg.get(0);
            }
            else if (arg) {
                this.el = arg;
                this.$el = $(arg);
            }
            this.initialize();
        }
        View.prototype.initialize = function () {
        };
        View.prototype.remove = function () {
            this.$el.remove();
            this.$el = this.el = null;
        };
        View.prototype.$ = function (selector) {
            return this.$el.find(selector);
        };
        return View;
    })();
    var RepositoryListItem = (function (_super) {
        __extends(RepositoryListItem, _super);
        function RepositoryListItem(data) {
            _super.call(this, '');
        }
        return RepositoryListItem;
    })(View);
    var RepositoryList = (function (_super) {
        __extends(RepositoryList, _super);
        function RepositoryList() {
            _super.apply(this, arguments);
            this.rows = {};
            this.count = 0;
            this.offset = 0;
            this.numPages = 0;
            this.itemsPerPage = 10;
        }
        RepositoryList.prototype.initialize = function () {
            var _this = this;
            this.rowTemplate = _.template(this.$('script.list-row').html());
            this.detailsTemplate = _.template(this.$('script.list-details').html());
            this.paginationTemplate = _.template(this.$('script.pagination').html());
            this.$rows = this.$('ul.list-rows').appendTo(this.el);
            this.$pagination = this.$('ul.list-pagination').appendTo(this.el);
            this.$el.on('click', '.list-pagination a', function (e) {
                _this.setPage(parseInt($(e.target).attr('data-page')));
                e.preventDefault();
            }).on('click', '.header', function (e) {
                var el = e.target;
                while (el.parentNode) {
                    if (el.tagName == 'A')
                        return;
                    el = el.parentNode;
                }
                _this.setExpanded($(e.target));
                e.preventDefault();
            }).on('click', '.expand', function (e) {
                _this.setExpanded($(e.target), true);
                e.preventDefault();
            });
        };
        RepositoryList.prototype.setList = function (list) {
            this.list = list;
            this.offset = 0;
            this.count = this.list.length;
            this.numPages = Math.ceil(this.count / this.itemsPerPage);
            this.renderList();
            this.renderPagination();
        };
        RepositoryList.prototype.setPage = function (value) {
            value = Math.max(0, Math.min(this.numPages, value));
            this.offset = value * this.itemsPerPage;
            this.renderList();
            this.renderPagination();
        };
        RepositoryList.prototype.setExpanded = function ($el, expand) {
            var _this = this;
            if (expand === void 0) { expand = false; }
            var $item = $el.parents('li');
            animateHeight($item, function () {
                if (!$item.hasClass('expanded')) {
                    $item.addClass('expanded').addClass('expanding');
                    if ($item.find('.details').length == 0) {
                        var id = parseInt($item.attr('data-repository-id'));
                        var content = _(_this.list).findWhere({ id: id });
                        if (content) {
                            $item.append(_this.detailsTemplate(content));
                        }
                    }
                }
                else {
                    if (expand)
                        return;
                    $item.removeClass('expanded').addClass('collapsing');
                }
            }, function () {
                $item.removeClass('expanding collapsing');
            });
        };
        RepositoryList.prototype.renderList = function () {
            this.$el.toggleClass('empty', this.count == 0);
            this.$rows.empty();
            if (this.count == 0)
                return;
            var rows = {};
            var min = this.offset;
            var max = Math.min(this.count, min + this.itemsPerPage);
            for (var index = min; index < max; index++) {
                var data = this.list[index];
                var $row = this.rows[data.id];
                if ($row) {
                    this.rows[data.id] = null;
                }
                else {
                    $row = $(this.rowTemplate(this.list[index]));
                }
                rows[data.id] = $row;
                this.$rows.append($row);
            }
            _(this.rows).each(function ($row) { return $row ? $row.remove() : null; });
            this.rows = rows;
        };
        RepositoryList.prototype.renderPagination = function () {
            var mid = Math.floor(this.offset / this.itemsPerPage);
            var min = Math.max(0, mid - 3);
            var max = Math.min(this.numPages - 1, min + 6);
            min = Math.max(0, max - 6);
            this.$pagination
                .empty()
                .toggleClass('empty', this.numPages < 2);
            if (mid > 0) {
                this.$pagination.append(this.paginationTemplate({ index: mid - 1, display: '&lt;' }));
            }
            for (var index = min; index <= max; index++) {
                var $el = $(this.paginationTemplate({ index: index, display: index + 1 }));
                if (index == mid)
                    $el.addClass('current');
                this.$pagination.append($el);
            }
            if (mid < this.numPages - 1) {
                this.$pagination.append(this.paginationTemplate({ index: mid + 1, display: '&gt;' }));
            }
        };
        return RepositoryList;
    })(View);
    var RepositorySearch = (function (_super) {
        __extends(RepositorySearch, _super);
        function RepositorySearch(el, repository) {
            var _this = this;
            _super.call(this, el);
            this.repository = repository;
            this.list = new RepositoryList(this.$('.list'));
            var $query = this.$('.query');
            this.$el.on('input', '.query', function (event) {
                var value = $.trim($query.val());
                if (value == '') {
                    _this.list.setList([]);
                    _this.$el.removeClass('has-sword');
                }
                else {
                    _this.$el.addClass('has-sword');
                    _this.repository.query(value, function (result) {
                        _this.list.setList(result);
                    });
                }
            }).on('click', '.search', function (e) {
                e.preventDefault();
                if ($query.val() != '') {
                    $query.val('').focus();
                    _this.$el.removeClass('has-sword');
                    _this.list.setList([]);
                }
                else {
                    $query.focus();
                }
            }).on('click', '.all', function (e) {
                e.preventDefault();
                _this.repository.require(function (data) {
                    $query.val('');
                    _this.$el.removeClass('has-sword');
                    _this.list.setList(data.content);
                });
            });
        }
        return RepositorySearch;
    })(View);
    $(function () {
        if (console && console.log) {
            console.log('\n\nShow your stuff at https://github.com/DefinitelyTyped/definitelytyped.github.io\n\n');
        }
        var repository = new Repository('/tsd/data/repository.json');
        $('.dt-repository-search').each(function (n, el) {
            new RepositorySearch(el, repository);
        });
    });
})(dt || (dt = {}));
