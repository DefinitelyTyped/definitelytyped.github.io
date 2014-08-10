if (console && console.log) {
	console.log('\n\nShow your stuff at https://github.com/DefinitelyTyped/definitelytyped.github.io\n\n');
}


/**
 * Repository search for definitelytyped.github.io
 */
(function() {
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
        var from = $el.height(), to;
        noTransition($el, function () {
            callback();

            $el.css('height', '');
            to = $el.height();
            if (from != to && transition)
                $el.css('height', from);
        });

        if (from != to && transition) {
            $el.css('height', to);
            $el.on(transition.endEvent, function () {
                noTransition($el, function () {
                    $el.off(transition.endEvent).css('height', '');
                    if (success)
                        success();
                });
            });
        }
    }


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
                return content.id = id;
            });
            _this.data = data;
            _this.request = null;
            return data;
        });
    };

    Repository.prototype.get = function (callback) {
        if (this.data) {
            callback(this.data);
        } else {
            this.load();
            this.request = this.request.then(function (data) {
                callback(data);
                return data;
            });
        }
    };

    var repository = new Repository('/tsd/data/repository.json');


    function RepositorySearch(el, list) {
        var _this = this;
        this.el = el;
        this.list = list;
        var $el = $(el);
        var $input = $el.find('input').on('focusin', function (event) {
            return repository.load();
        }).on('input', function (event) {
            var value = $input.val();
            if ($.trim(value) == '' && _this.isPrompting) {
                if (_this.list)
                    _this.list.hide();
            } else {
                _this.getList().show().setQuery(value);
            }
        });

        this.isPrompting = !list || $el.attr('data-prompting') == 'true';
        if (this.isPrompting && list)
            list.hide();
    }

    RepositorySearch.prototype.getList = function () {
        if (!this.list) {
            var $el = $('<ul class="repository-list" />').insertAfter(this.el);
            this.list = new RepositoryList($el.get(0));
        }
        return this.list;
    };


    function RepositoryList(el) {
        var _this = this;
        this.el = el;
        this.rows = {};
        this.count = 0;
        this.page = 0;
        this.numPages = 0;
        this.rowsPerPage = 20;
        this.rowTemplate = _.template($('#repository-list-row').html());
        this.detailsTemplate = _.template($('#repository-list-details').html());

        this.$el = $(el);
        this.$el.on('click', function (event) {
            var target = event.target;
            while (target) {
                if (target.hasAttribute && target.hasAttribute('data-repository-id')) {
                    event.preventDefault();
                    _this.toggle(target);
                    break;
                } else {
                    target = target.parentNode;
                }
            }
        });

        repository.get(function (data) {
            return _this.setCollection(data.content);
        });
    }

    RepositoryList.prototype.hide = function () {
        this.$el.hide();
        return this;
    };

    RepositoryList.prototype.show = function () {
        this.$el.show();
        return this;
    };

    RepositoryList.prototype.render = function () {
        var _this = this;
        var rows = {};
        if (this.count > 0) {
            this.$el.removeClass('empty');
            var min = Math.min(this.count - 1, this.page * this.rowsPerPage);
            var max = Math.min(this.count - 1, min + this.rowsPerPage);

            for (var index = min; index <= max; index++) {
                var content = this.collection[index];
                var row = this.rows[content.id];

                if (!row) {
                    row = $(this.rowTemplate(content)).get(0);
                } else {
                    this.rows[content.id] = null;
                }

                rows[content.id] = row;
                this.el.appendChild(row);
            }
        } else {
            this.$el.addClass('empty');
        }

        _(this.rows).each(function (row) {
            return row ? _this.el.removeChild(row) : null;
        });
        this.rows = rows;
    };

    RepositoryList.prototype.toggle = function (el, expand) {
        var _this = this;
        var $el = $(el);
        var $item = $el.parents('li');
        animateHeight($item, function () {
            if (expand || !$item.hasClass('expanded')) {
                $item.addClass('expanded').addClass('expanding');
                if ($item.find('.details').length == 0) {
                    var id = parseInt($el.attr('data-repository-id'));
                    var content = _(_this.collection).findWhere({ id: id });
                    if (content) {
                        $item.append(_this.detailsTemplate(content));
                    }
                }
            } else {
                $item.removeClass('expanded').addClass('collapsing');
            }
        }, function () {
            $item.removeClass('expanding collapsing');
        });
    };

    RepositoryList.prototype.setQuery = function (query) {
        var _this = this;
        query = query.toLowerCase();
        repository.get(function (data) {
            _this.setCollection(_(data.content).filter(function (content) {
                return content.name.indexOf(query) != -1;
            }));
        });
    };

    RepositoryList.prototype.setCollection = function (collection) {
        this.collection = collection.sort(function (a, b) {
            var n = a.name.toLowerCase();
            var m = b.name.toLowerCase();
            if (n == m)
                return 0;
            return n > m ? 1 : -1;
        });

        this.count = collection.length;
        this.page = 0;
        this.numPages = Math.ceil(this.count / this.rowsPerPage);

        this.render();
    };


    $(function () {
        if (console && console.log) {
            console.log('\n\nShow your stuff at https://github.com/DefinitelyTyped/definitelytyped.github.io\n\n');
        }

        var search = document.getElementById('repository-search');
        var list = document.getElementById('repository-list');
        if (search && list) {
            new RepositorySearch(search, new RepositoryList(list));
        }
    });
})();