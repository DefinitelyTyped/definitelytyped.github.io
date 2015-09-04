var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var dt;
(function (dt) {
    var menu;
    (function (menu) {
        var MenuState;
        (function (MenuState) {
            MenuState[MenuState["Top"] = 0] = "Top";
            MenuState[MenuState["Sticky"] = 1] = "Sticky";
            MenuState[MenuState["Bottom"] = 2] = "Bottom";
        })(MenuState || (MenuState = {}));
        var Component = (function (_super) {
            __extends(Component, _super);
            function Component(options) {
                var _this = this;
                _super.call(this, options);
                this.state = MenuState.Top;
                if (dt.hasPositionSticky) {
                    dt.addClass(document.body, 'has-sticky');
                    return;
                }
                dt.addEventListener(window, 'scroll', function () { return _this.onScroll(); });
                dt.addEventListener(window, 'resize', function () { return _this.onResize(); });
                FontFaceOnload('Open Sans', { success: function () { return _this.onResize(); } });
                FontFaceOnload('Raleway', { success: function () { return _this.onResize(); } });
                this.onResize();
            }
            Component.prototype.setState = function (value) {
                if (this.state == value)
                    return;
                dt.removeClass(this.el, MenuState[this.state].toLowerCase());
                this.state = value;
                dt.addClass(this.el, MenuState[this.state].toLowerCase());
            };
            Component.prototype.onScroll = function () {
                var at = dt.scrollTop();
                if (at < this.min) {
                    this.setState(MenuState.Top);
                }
                else if (at > this.max) {
                    this.setState(MenuState.Bottom);
                }
                else {
                    this.setState(MenuState.Sticky);
                }
            };
            Component.prototype.onResize = function () {
                var el = (this.el.parentNode);
                this.min = el.getBoundingClientRect().top + dt.scrollTop() - 40;
                var el = (el.parentNode);
                this.max = this.min + el.offsetHeight - this.el.offsetHeight + 4;
                this.onScroll();
            };
            return Component;
        })(Backbone.NativeView);
        menu.Component = Component;
    })(menu = dt.menu || (dt.menu = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var navigation;
    (function (navigation) {
        var Component = (function (_super) {
            __extends(Component, _super);
            function Component(options) {
                _super.call(this, _.defaults(options || {}, {
                    events: {
                        'click .menu-widget': 'onWidgetClick'
                    }
                }));
                this.isExpanded = false;
            }
            Component.prototype.setTransition = function (transition, duration) {
                var _this = this;
                if (duration === void 0) { duration = 400; }
                if (this.transition == transition)
                    return;
                if (this.transition) {
                    clearTimeout(this.transitionTimeout);
                    dt.removeClass(this.el, this.transition);
                }
                dt.addClass(this.el, transition);
                this.transition = transition;
                this.transitionTimeout = setTimeout(function () {
                    dt.removeClass(_this.el, transition);
                    _this.transition = _this.transitionTimeout = null;
                }, duration);
            };
            Component.prototype.onWidgetClick = function () {
                this.isExpanded = !this.isExpanded;
                dt.toggleClass(document.documentElement, 'has-menu', this.isExpanded);
                if (this.isExpanded) {
                    this.setTransition('menu-fade-in', 750);
                }
                else {
                    this.setTransition('menu-fade-out', 250);
                }
            };
            return Component;
        })(Backbone.NativeView);
        navigation.Component = Component;
    })(navigation = dt.navigation || (dt.navigation = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var repository;
    (function (repository) {
        var Component = (function (_super) {
            __extends(Component, _super);
            function Component(options) {
                _super.call(this, options);
                this.model = this.model || new repository.ViewState();
                repository.ListItem.prototype.compactTemplate = this.getTemplate('list-row-compact');
                repository.ListItem.prototype.detailsTemplate = this.getTemplate('list-row-details');
                repository.Pagination.prototype.itemTemplate = this.getTemplate('pagination');
                this.form = new repository.SearchForm({
                    el: this.el.querySelector('.dt-repository-search-form'),
                    model: this.model
                });
                this.results = new repository.Results({
                    el: this.el.querySelector('.dt-repository-search-results'),
                    model: this.model
                });
            }
            Component.prototype.getTemplate = function (name) {
                var el = this.el.querySelector('script.' + name);
                if (el) {
                    return _.template(el.innerHTML);
                }
                else {
                    return function () { return ''; };
                }
            };
            return Component;
        })(Backbone.NativeView);
        repository.Component = Component;
    })(repository = dt.repository || (dt.repository = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var repository;
    (function (repository) {
        var Repository = (function (_super) {
            __extends(Repository, _super);
            function Repository(jsonUrl) {
                if (jsonUrl === void 0) { jsonUrl = '/tsd/data/repository.json'; }
                _super.call(this);
                this.jsonUrl = jsonUrl;
                this.state = 0;
                this.load();
            }
            Repository.prototype.isLoaded = function () {
                return this.state == 2;
            };
            Repository.prototype.load = function () {
                var _this = this;
                if (this.state != 0)
                    return;
                this.setState(1);
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        if (request.status >= 200 && request.status < 400) {
                            _this.setData(request.responseText);
                            _this.setState(2);
                        }
                        else {
                            _this.setState(3);
                        }
                    }
                };
                request.open('GET', this.jsonUrl, true);
                request.send();
            };
            Repository.prototype.require = function (callback) {
                if (this.data) {
                    callback(this.data);
                }
                else {
                    this.once('loaded', callback);
                    this.load();
                }
            };
            Repository.prototype.query = function (sword, callback) {
                this.require(function (data) {
                    var swords = sword.toLowerCase().split(/\s+/);
                    var count = swords.length;
                    callback(_(data.content).filter(function (content) {
                        var score = 0;
                        for (var index = 0; index < count; index++) {
                            var sword = swords[index];
                            var offset = content.name.indexOf(sword);
                            if (offset != -1) {
                                if (count == 1) {
                                    score += (content.name == sword ? 9 : (offset == 0 ? 2 : 1));
                                }
                                else {
                                    score += offset == 0 ? 2 : 1;
                                }
                            }
                            else {
                                score -= 1;
                            }
                        }
                        content.score = score / count;
                        return content.score >= 1;
                    }).sort(function (a, b) {
                        if (a.score == b.score) {
                            if (a.name == b.name)
                                return 0;
                            return a.sword > b.sword ? 1 : -1;
                        }
                        else {
                            return a.score < b.score ? 1 : -1;
                        }
                    }));
                });
            };
            Repository.prototype.setState = function (value) {
                this.set('state', value);
            };
            Repository.prototype.setData = function (json) {
                var data = JSON.parse(json);
                var paths = {};
                _(data.content).forEach(function (content, id) {
                    paths[content.path] = id;
                    content.id = id;
                    content.sword = content.name.toLowerCase();
                    content.download = content.info.reposUrl + '/raw/master/' + content.path;
                    content.github = content.info.reposUrl + '/tree/master/' + content.project;
                    content.nuget = 'http://www.nuget.org/packages/' + content.project + '.TypeScript.DefinitelyTyped/';
                });
                _(data.content).forEach(function (content, id) {
                    content.references = _(content.info.references).map(function (path) {
                        var result = { location: path };
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
                data.content.sort(function (a, b) { return a.sword == b.sword ? 0 : (a.sword > b.sword ? 1 : -1); });
                this.data = data;
                this.trigger('loaded', data);
            };
            return Repository;
        })(Backbone.Model);
        repository.Repository = Repository;
    })(repository = dt.repository || (dt.repository = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var repository;
    (function (repository) {
        (function (ViewMode) {
            ViewMode[ViewMode["Idle"] = 0] = "Idle";
            ViewMode[ViewMode["Query"] = 1] = "Query";
            ViewMode[ViewMode["Loading"] = 2] = "Loading";
            ViewMode[ViewMode["Empty"] = 3] = "Empty";
            ViewMode[ViewMode["All"] = 4] = "All";
        })(repository.ViewMode || (repository.ViewMode = {}));
        var ViewMode = repository.ViewMode;
        var ViewState = (function (_super) {
            __extends(ViewState, _super);
            function ViewState(attributes, options) {
                _super.call(this, attributes, options);
                if (options && options.repository) {
                    this.repository = options.repository;
                }
                else {
                    this.repository = new repository.Repository();
                }
            }
            ViewState.prototype.defaults = function () {
                return {
                    query: '',
                    mode: ViewMode.Idle,
                    results: [],
                    resultsCount: 0,
                    resultsPages: 0,
                    resultsOffset: 0,
                    resultsPerPage: 10
                };
            };
            ViewState.prototype.idle = function () {
                this.set('mode', ViewMode.Idle);
                this.set('query', '');
                this.setResults([]);
            };
            ViewState.prototype.all = function () {
                var _this = this;
                if (this.attributes.mode == ViewMode.All)
                    return;
                this.set('query', '');
                if (!this.repository.isLoaded()) {
                    this.set('mode', ViewMode.Loading);
                }
                this.repository.require(function (data) {
                    if (_this.attributes.query != '')
                        return;
                    _this.set('mode', ViewMode.All);
                    _this.setResults(data.content);
                });
            };
            ViewState.prototype.query = function (value) {
                var _this = this;
                value = value.replace(/^\s+|\s+$/g, '');
                if (this.attributes.query == value)
                    return;
                this.set('query', value);
                if (value == '') {
                    this.idle();
                }
                else {
                    if (!this.repository.isLoaded()) {
                        this.set('mode', ViewMode.Loading);
                    }
                    this.repository.query(value, function (results) {
                        if (_this.attributes.query != value)
                            return;
                        _this.set('mode', results.length ? ViewMode.Query : ViewMode.Empty);
                        _this.setResults(results);
                    });
                }
            };
            ViewState.prototype.getResults = function () {
                return this.get('results');
            };
            ViewState.prototype.getVisibleResults = function () {
                var results = this.getResults();
                var start = this.get('resultsOffset');
                var end = Math.min(start + this.get('resultsPerPage'), this.get('resultsCount'));
                return results.slice(start, end);
            };
            ViewState.prototype.setResults = function (value) {
                if (!_.isArray(value))
                    value = [];
                var count = value.length;
                var resultsPerPage = this.attributes.resultsPerPage;
                this.set({
                    results: value,
                    resultsCount: count,
                    resultsPages: Math.ceil(count / resultsPerPage),
                    resultsOffset: 0
                });
            };
            return ViewState;
        })(Backbone.Model);
        repository.ViewState = ViewState;
    })(repository = dt.repository || (dt.repository = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var repository;
    (function (repository) {
        var List = (function (_super) {
            __extends(List, _super);
            function List(options) {
                _super.call(this, _.defaults(options || {}, {
                    tagName: 'ul',
                    className: 'dt-repository-search-list'
                }));
                this.listenTo(this.model, 'change:results', this.onResultsChanged);
                this.listenTo(this.model, 'change:resultsOffset', this.onResultsChanged);
            }
            List.prototype.onResultsChanged = function (state) {
                var _this = this;
                _(this.items).each(function (item) { return item.remove(); });
                this.items = [];
                _(state.getVisibleResults()).each(function (result) {
                    var item = new ListItem({ model: result });
                    _this.items.push(item);
                    _this.el.appendChild(item.el);
                });
                if (this.items.length > 0) {
                    this.el.classList ? this.el.classList.remove('empty') : this.el.className;
                }
                else {
                }
            };
            return List;
        })(Backbone.NativeView);
        repository.List = List;
        var ListItem = (function (_super) {
            __extends(ListItem, _super);
            function ListItem(options) {
                _super.call(this, _.defaults(options || {}, {
                    tagName: 'li',
                    className: 'list-item',
                    events: {
                        'click .header': 'onHeaderClick'
                    }
                }));
                this.el.innerHTML = this.compactTemplate(this.model);
            }
            ListItem.prototype.setExpanded = function (value) {
                var _this = this;
                if (this.isExpanded == value)
                    return;
                this.isExpanded = value;
                var transition;
                if (value) {
                    this.createDetails();
                    transition = 'expanding';
                }
                else {
                    transition = 'collapsing';
                }
                dt.transitionHeight(this.el, function () {
                    dt.toggleClass(_this.el, 'expanded', value);
                });
                this.setTransition(transition);
            };
            ListItem.prototype.setTransition = function (transition, duration) {
                var _this = this;
                if (duration === void 0) { duration = 400; }
                if (this.transition == transition)
                    return;
                if (this.transition) {
                    clearTimeout(this.transitionTimeout);
                    dt.removeClass(this.el, this.transition);
                }
                dt.addClass(this.el, transition);
                this.transition = transition;
                this.transitionTimeout = setTimeout(function () {
                    dt.removeClass(_this.el, transition);
                    _this.transition = _this.transitionTimeout = null;
                }, duration);
            };
            ListItem.prototype.createDetails = function () {
                if (this.isDetailCreated)
                    return;
                this.isDetailCreated = true;
                var details = document.createElement('div');
                details.innerHTML = this.detailsTemplate(this.model);
                while (details.firstChild) {
                    this.el.appendChild(details.firstChild);
                }
            };
            ListItem.prototype.onHeaderClick = function (e) {
                var el = (e.target || e.srcElement);
                if (el && el.tagName == 'A')
                    return;
                dt.preventDefault(e);
                this.setExpanded(!this.isExpanded);
            };
            return ListItem;
        })(Backbone.NativeView);
        repository.ListItem = ListItem;
    })(repository = dt.repository || (dt.repository = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var repository;
    (function (repository) {
        var Pagination = (function (_super) {
            __extends(Pagination, _super);
            function Pagination(options) {
                _super.call(this, _.defaults(options || {}, {
                    tagName: 'ul',
                    className: 'dt-repository-search-pagination',
                    events: {
                        'click li': 'onItemClick',
                    }
                }));
                this.listenTo(this.model, 'change:results', this.onResultsChanged);
                this.listenTo(this.model, 'change:resultsOffset', this.onResultsChanged);
            }
            Pagination.prototype.render = function () {
                var items = this.getItems();
                var html = '';
                for (var _i = 0; _i < items.length; _i++) {
                    var item = items[_i];
                    html += this.itemTemplate(item);
                }
                this.el.innerHTML = html;
                dt.toggleClass(this.el, 'empty', items.length == 0);
                return this;
            };
            Pagination.prototype.getItems = function () {
                var model = this.model.attributes;
                if (model.resultsPages < 2) {
                    return [];
                }
                var current = Math.floor(model.resultsOffset / model.resultsPerPage);
                var min = Math.max(0, current - 2);
                var max = Math.min(model.resultsPages - 1, min + 4);
                min = Math.max(0, max - 4);
                return this.getItemsRange(current, min, max, model.resultsPages);
            };
            Pagination.prototype.getItemsRange = function (current, min, max, count) {
                var result = [];
                if (current > 0) {
                    result.push({
                        index: current - 1,
                        label: '&lt;',
                        className: 'previous'
                    });
                }
                else {
                    result.push({
                        label: '&lt;',
                        className: 'previous disabled'
                    });
                }
                for (var index = min; index <= max; index++) {
                    result.push({
                        index: index,
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
                }
                else {
                    result.push({
                        label: '&gt;',
                        className: 'next disabled'
                    });
                }
                return result;
            };
            Pagination.prototype.onResultsChanged = function () {
                this.render();
            };
            Pagination.prototype.onItemClick = function (e) {
                var el = e.target;
                if (el.hasAttribute('data-index')) {
                    var offset = parseInt(el.getAttribute('data-index'));
                    offset *= this.model.attributes.resultsPerPage;
                    this.model.set('resultsOffset', offset);
                    dt.preventDefault(e);
                }
            };
            return Pagination;
        })(Backbone.NativeView);
        repository.Pagination = Pagination;
    })(repository = dt.repository || (dt.repository = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var repository;
    (function (repository) {
        var Results = (function (_super) {
            __extends(Results, _super);
            function Results(options) {
                _super.call(this, options);
                this.mode = 'idle';
                this.list = new repository.List({
                    el: this.el.querySelector('ul.dt-repository-search-list'),
                    model: this.model
                });
                this.pagination = new repository.Pagination({
                    el: this.el.querySelector('ul.dt-repository-search-pagination'),
                    model: this.model
                });
                this.listenTo(this.model, 'change:mode', this.onModeChanged);
            }
            Results.prototype.onModeChanged = function (state, mode) {
                dt.removeClass(this.el, this.mode);
                this.mode = repository.ViewMode[mode].toLowerCase();
                dt.addClass(this.el, this.mode);
            };
            return Results;
        })(Backbone.NativeView);
        repository.Results = Results;
    })(repository = dt.repository || (dt.repository = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var repository;
    (function (repository) {
        var SearchForm = (function (_super) {
            __extends(SearchForm, _super);
            function SearchForm(options) {
                _super.call(this, options);
                this.delegateEvents({
                    'submit': function (e) { return dt.preventDefault(e); },
                    'click .all': 'onAllClick'
                });
                this.sword = new SwordField({
                    el: this.el.querySelector('dl.sword'),
                    model: this.model
                });
            }
            SearchForm.prototype.onAllClick = function (e) {
                dt.preventDefault(e);
                this.model.all();
            };
            return SearchForm;
        })(Backbone.NativeView);
        repository.SearchForm = SearchForm;
        var SwordField = (function (_super) {
            __extends(SwordField, _super);
            function SwordField(options) {
                var _this = this;
                _super.call(this, options);
                this.input = this.el.querySelector('input');
                dt.addEventListener(this.input, 'input', function () { return _this.onInputChanged(); });
                dt.addEventListener(this.input, 'keydown', function (e) { return _this.onInputKeyDown(e); });
                this.listenTo(this.model, 'change:query', this.onQueryChanged);
                this.delegateEvents({
                    'click button': 'onButtonClick'
                });
                if (this.input.value != '') {
                    _.defer(function () { return _this.commit(); });
                }
            }
            SwordField.prototype.commit = function () {
                if (this.isCommiting)
                    return;
                this.isCommiting = true;
                var value = this.input.value;
                dt.toggleClass(this.el, 'has-sword', value != '');
                this.model.query(value);
                this.isCommiting = false;
            };
            SwordField.prototype.onQueryChanged = function (state, query) {
                if (!this.isCommiting) {
                    dt.toggleClass(this.el, 'has-sword', query != '');
                    this.input.value = query;
                }
            };
            SwordField.prototype.onInputChanged = function () {
                this.commit();
            };
            SwordField.prototype.onInputKeyDown = function (e) {
                if (e.keyCode == 13) {
                    this.commit();
                }
                else if (e.keyCode == 27) {
                    this.model.idle();
                }
            };
            SwordField.prototype.onButtonClick = function (e) {
                dt.preventDefault(e);
                if (this.model.attributes.query != '') {
                    this.model.idle();
                }
                else {
                    this.commit();
                }
            };
            return SwordField;
        })(Backbone.NativeView);
    })(repository = dt.repository || (dt.repository = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var stars;
    (function (stars) {
        var Component = (function (_super) {
            __extends(Component, _super);
            function Component(options) {
                var _this = this;
                _super.call(this, options);
                this.width = 0;
                this.height = 0;
                this.tilt = 0;
                this.lastFrame = Date.now();
                if (!dt.transformStyle || !Component.isCanvasSupported()) {
                    dt.addClass(this.el, 'fallback');
                    return;
                }
                this.layers = [
                    new stars.StarLayer({ className: 'dust', component: this, depth: 1.00, spriteSrc: '/assets/images/skyline-dust.png', spriteSize: 200, density: 0.25, isDust: true }),
                    new stars.StarLayer({ className: 'stars-sm', component: this, depth: 0.90, spriteSrc: '/assets/images/skyline-stars-sm.png', spriteSize: 10, density: 1.50 }),
                    this.fx = new stars.FXLayer({ className: 'fx', component: this, depth: 0.80, spriteSrc: '/assets/images/skyline-stars-md.png', spriteSize: 10, density: 2.00 }),
                    new stars.StarLayer({ className: 'stars-md', component: this, depth: 0.70, spriteSrc: '/assets/images/skyline-stars-md.png', spriteSize: 10, density: 0.50 }),
                    new stars.CityLayer({ className: 'city-a', component: this, depth: 0.33, spriteSrc: '/assets/images/skyline-city-a.png', colorFrom: '#0e1928', colorTo: '#1a2e49', offset: 300 }),
                    new stars.CityLayer({ className: 'city-b', component: this, depth: 0.00, spriteSrc: '/assets/images/skyline-city-b.png', colorFrom: '#172942', colorTo: '#1a2e49' })
                ];
                dt.addEventListener(window, 'resize', _.throttle(function () { return _this.onResize(); }, 100));
                this.onResize();
                this.update();
            }
            Component.prototype.update = function () {
                var _this = this;
                var now = Date.now();
                this.fx.update(now - this.lastFrame);
                this.lastFrame = now;
                var tilt = Math.min(300, this.height * 0.5);
                tilt *= Math.min(1, dt.scrollTop() / this.height);
                if (this.tilt != tilt) {
                    this.tilt = tilt;
                    for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
                        var layer = _a[_i];
                        layer.setTilt(tilt);
                    }
                }
                window.requestAnimationFrame(function () { return _this.update(); });
            };
            Component.prototype.triggerMeasure = function () {
                for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
                    var layer = _a[_i];
                    layer.setSize(this.width, this.height);
                }
            };
            Component.prototype.onResize = function () {
                var width = this.el.offsetWidth;
                var height = this.el.offsetHeight;
                if (this.width == width && this.height == height) {
                    return;
                }
                this.width = width;
                this.height = height;
                this.triggerMeasure();
            };
            Component.isCanvasSupported = function () {
                var elem = document.createElement('canvas');
                return !!(elem.getContext && elem.getContext('2d'));
            };
            return Component;
        })(Backbone.NativeView);
        stars.Component = Component;
    })(stars = dt.stars || (dt.stars = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var stars;
    (function (stars) {
        var Layer = (function (_super) {
            __extends(Layer, _super);
            function Layer(options) {
                _super.call(this, options);
                this.depth = 1;
                this.width = 0;
                this.height = 0;
                this.component = options.component;
                this.component.el.appendChild(this.el);
                if (options.depth !== void 0) {
                    this.depth = options.depth;
                }
            }
            Layer.prototype.setTilt = function (tilt) {
                this.el.style[dt.transformStyle] = 'translate(0,' + (tilt * this.depth) + 'px)';
            };
            Layer.prototype.setSize = function (width, height) {
                var size = this.measure({ width: width, height: height });
                if (this.width != size.width || this.height != size.height) {
                    this.width = width;
                    this.height = height;
                    this.draw();
                }
            };
            Layer.prototype.draw = function () { };
            Layer.prototype.measure = function (size) {
                return size;
            };
            return Layer;
        })(Backbone.NativeView);
        stars.Layer = Layer;
        var CanvasLayer = (function (_super) {
            __extends(CanvasLayer, _super);
            function CanvasLayer(options) {
                _super.call(this, _.defaults(options || {}, {
                    tagName: 'canvas'
                }));
                this.context = this.el.getContext('2d');
            }
            CanvasLayer.prototype.measure = function (size) {
                if (this.width != size.width || this.height != size.height) {
                    this.el.width = size.width;
                    this.el.height = size.height;
                }
                return size;
            };
            CanvasLayer.loadImage = function (src, callback) {
                var image = document.createElement('img');
                var onLoaded = function () {
                    dt.removeEventListener(image, 'load', onLoaded);
                    callback(image);
                };
                dt.addEventListener(image, 'load', onLoaded);
                image.src = src;
            };
            return CanvasLayer;
        })(Layer);
        stars.CanvasLayer = CanvasLayer;
    })(stars = dt.stars || (dt.stars = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var stars;
    (function (stars) {
        var CityLayer = (function (_super) {
            __extends(CityLayer, _super);
            function CityLayer(options) {
                var _this = this;
                _super.call(this, options);
                this.spriteWidth = 0;
                this.spriteHeight = 0;
                this.offset = 0;
                this.scale = 1;
                if (options.offset)
                    this.offset = options.offset;
                stars.CanvasLayer.loadImage(options.spriteSrc, function (image) {
                    _this.setSprite(image, options.colorFrom, options.colorTo);
                });
            }
            CityLayer.prototype.draw = function () {
                if (!this.sprite)
                    return;
                var ctx = this.context;
                var scale = this.scale;
                var offset = -Math.abs(this.offset * scale);
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.setTransform(scale, 0, 0, scale, 0, 0);
                while (offset < this.width) {
                    ctx.drawImage(this.sprite, offset / scale, 0);
                    offset = Math.floor(offset + this.spriteWidth * scale);
                }
            };
            CityLayer.prototype.measure = function (size) {
                var scale = this.scale = Math.min(1, size.width / this.spriteWidth);
                size.height = Math.floor(this.spriteHeight * scale);
                return _super.prototype.measure.call(this, size);
            };
            CityLayer.prototype.setSprite = function (image, colorFrom, colorTo) {
                var canvas = this.sprite = document.createElement('canvas');
                var width = canvas.width = this.spriteWidth = image.naturalWidth;
                var height = canvas.height = this.spriteHeight = image.naturalHeight;
                var ctx = canvas.getContext('2d');
                var gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, colorFrom);
                gradient.addColorStop(1, colorTo);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                ctx.globalCompositeOperation = 'destination-in';
                ctx.drawImage(image, 0, 0);
                this.component.triggerMeasure();
            };
            return CityLayer;
        })(stars.CanvasLayer);
        stars.CityLayer = CityLayer;
    })(stars = dt.stars || (dt.stars = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var stars;
    (function (stars) {
        var FXLayer = (function (_super) {
            __extends(FXLayer, _super);
            function FXLayer(options) {
                var _this = this;
                _super.call(this, options);
                this.stars = [];
                this.density = 2;
                stars.CanvasLayer.loadImage(options.spriteSrc, function (image) {
                    _this.setSprite(image, options.spriteSize);
                });
            }
            FXLayer.prototype.update = function (delta) {
                if (!this.sprites)
                    return;
                var ctx = this.context;
                var sprites = this.sprites;
                var width = this.width;
                var height = this.height;
                ctx.clearRect(0, 0, width, height);
                for (var _i = 0, _a = this.stars; _i < _a.length; _i++) {
                    var star = _a[_i];
                    star.update(ctx, delta, sprites, width, height);
                }
            };
            FXLayer.prototype.setSprite = function (image, size) {
                var count = image.height / size;
                this.sprites = new Array(count);
                for (var index = 0; index < count; index++) {
                    var canvas = this.sprites[index] = document.createElement('canvas');
                    canvas.width = canvas.height = size;
                    canvas.getContext('2d').drawImage(image, 0, -index * size);
                }
            };
            FXLayer.prototype.measure = function (size) {
                size.height *= 0.7;
                var count = Math.round((size.width * size.height) / 2000 * this.density);
                while (this.stars.length < count) {
                    this.stars.push(new FXStar({ parent: this }));
                }
                while (this.stars.length > count) {
                    this.stars.pop();
                }
                return _super.prototype.measure.call(this, size);
            };
            return FXLayer;
        })(stars.CanvasLayer);
        stars.FXLayer = FXLayer;
        var FXStar = (function () {
            function FXStar(options) {
                this.x = 0;
                this.y = 0;
                this.sprite = 0;
                this.randomize();
                this.parent = options.parent;
                this.age += (Math.abs(this.age) + this.lifetime) * Math.random();
            }
            FXStar.prototype.update = function (ctx, delta, sprites, width, height) {
                var age = this.age += delta;
                if (age > this.lifetime) {
                    this.randomize();
                }
                else if (age > 0) {
                    var rel = age / this.lifetime;
                    var opacity = 0.5 + ((Math.sin(age / this.frequency) + 1) * 0.25);
                    if (rel < 0.25) {
                        opacity *= rel * 4;
                    }
                    else if (rel > 0.75) {
                        opacity *= (1 - rel) * 4;
                    }
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(sprites[this.sprite], Math.floor(this.x * width), Math.floor(this.y * height));
                }
            };
            FXStar.prototype.randomize = function () {
                this.x = Math.random();
                this.y = Math.random();
                this.sprite = Math.min(9, Math.floor(Math.random() * 10));
                this.age = -(1000 + Math.random() * 2000);
                this.frequency = 150 + Math.random() * 300;
                this.lifetime = 2000 + Math.random() * 4000;
            };
            return FXStar;
        })();
        stars.FXStar = FXStar;
    })(stars = dt.stars || (dt.stars = {}));
})(dt || (dt = {}));
var dt;
(function (dt) {
    var stars;
    (function (stars) {
        var StarLayer = (function (_super) {
            __extends(StarLayer, _super);
            function StarLayer(options) {
                var _this = this;
                _super.call(this, options);
                this.positions = [];
                this.count = 0;
                this.offset = options.spriteSize * -0.5;
                this.isDust = !!options.isDust;
                this.density = options.density ? options.density : 1;
                stars.CanvasLayer.loadImage(options.spriteSrc, function (image) {
                    _this.setSprite(image, options.spriteSize);
                });
            }
            StarLayer.prototype.draw = function () {
                if (!this.sprites)
                    return;
                var ctx = this.context;
                var count = this.count;
                var width = this.width;
                var height = this.height;
                var positions = this.positions;
                var sprites = this.sprites;
                var offset = this.offset;
                var isDust = this.isDust;
                var dataLength = isDust ? 5 : 3;
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, width, height);
                for (var index = 0; index < count; index++) {
                    var at = index * dataLength;
                    var sprite = sprites[positions[at]];
                    var x = Math.round(width * positions[at + 1]);
                    var y = Math.round(height * positions[at + 2]);
                    ctx.setTransform(1, 0, 0, 1, x, y);
                    if (isDust) {
                        var scale = positions[at + 3];
                        ctx.scale(scale, scale);
                        ctx.rotate(positions[at + 4]);
                    }
                    ctx.drawImage(sprite, offset, offset);
                }
            };
            StarLayer.prototype.setSprite = function (image, size) {
                var count = image.height / size;
                this.sprites = new Array(count);
                for (var index = 0; index < count; index++) {
                    var canvas = this.sprites[index] = document.createElement('canvas');
                    canvas.width = canvas.height = size;
                    var ctx = canvas.getContext('2d');
                    if (this.isDust) {
                        var gradient = ctx.createLinearGradient(0, 0, size, size);
                        gradient.addColorStop(0.25, StarLayer.GRADIENTS[index * 2]);
                        gradient.addColorStop(0.75, StarLayer.GRADIENTS[index * 2 + 1]);
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, size, size);
                        ctx.globalAlpha = 0.05;
                        ctx.globalCompositeOperation = 'destination-in';
                        ctx.drawImage(image, 0, -index * size);
                    }
                    else {
                        ctx.drawImage(image, 0, -index * size);
                    }
                }
                this.precalculate();
                this.draw();
            };
            StarLayer.prototype.measure = function (size) {
                this.precalculate(size.width, size.height);
                return _super.prototype.measure.call(this, size);
            };
            StarLayer.prototype.precalculate = function (width, height) {
                if (width === void 0) { width = this.width; }
                if (height === void 0) { height = this.height; }
                if (!this.sprites)
                    return;
                this.count = Math.round((width * height) / 2000 * this.density);
                var positions = this.positions;
                var isDust = this.isDust;
                var spriteCount = this.sprites.length;
                var dataLength = isDust ? 5 : 3;
                var required = dataLength * this.count;
                var count = positions.length;
                positions.length = required;
                while (count < required) {
                    var spriteIndex = Math.floor(spriteCount * Math.random());
                    if (spriteIndex >= spriteCount) {
                        spriteIndex = spriteCount - 1;
                    }
                    positions[count] = spriteIndex;
                    positions[count + 1] = Math.random();
                    positions[count + 2] = Math.random();
                    if (isDust) {
                        positions[count + 3] = 1 + Math.random() * 2;
                        positions[count + 4] = Math.random() * Math.PI * 2;
                    }
                    count += dataLength;
                }
            };
            StarLayer.GRADIENTS = [
                '#ffffff', '#5e90e3',
                '#9281df', '#4a0bb3',
                '#81b4df', '#057c6d'
            ];
            return StarLayer;
        })(stars.CanvasLayer);
        stars.StarLayer = StarLayer;
    })(stars = dt.stars || (dt.stars = {}));
})(dt || (dt = {}));
(function (win) {
    win.requestAnimationFrame = (function () {
        return win.requestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            win.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
})(window);
var dt;
(function (dt) {
    function noTransition(el, callback) {
        if (!dt.transitionStyle)
            return callback();
        dt.addClass(el, 'no-transition');
        callback();
        el.getBoundingClientRect();
        dt.removeClass(el, 'no-transition');
    }
    dt.noTransition = noTransition;
    function transitionHeight(el, callback, success) {
        if (!dt.transitionStyle) {
            callback();
            if (success)
                success();
            return;
        }
        var hasTransition;
        var from = el.offsetHeight;
        var to = 0;
        noTransition(el, function () {
            el.style.height = null;
            callback();
            to = el.offsetHeight;
            if (from != to) {
                el.style.height = from + 'px';
                hasTransition = true;
            }
        });
        if (hasTransition) {
            var listener = function () {
                dt.removeEventListener(el, dt.transitionEndEvent, listener);
                noTransition(el, function () { return el.style.height = null; });
                if (success)
                    success();
            };
            dt.addEventListener(el, dt.transitionEndEvent, listener);
            el.style.height = to + 'px';
        }
    }
    dt.transitionHeight = transitionHeight;
})(dt || (dt = {}));
var dt;
(function (dt) {
    function addEventListener(el, eventName, listener) {
        if (el.addEventListener) {
            el.addEventListener(eventName, listener);
        }
        else {
            el.attachEvent('on' + eventName, listener);
        }
    }
    dt.addEventListener = addEventListener;
    function removeEventListener(el, eventName, listener) {
        if (el.removeEventListener) {
            el.removeEventListener(eventName, listener);
        }
        else {
            el.detachEvent('on' + eventName, listener);
        }
    }
    dt.removeEventListener = removeEventListener;
    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        }
        else {
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }
    dt.removeClass = removeClass;
    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        }
        else {
            if (!hasClass(el, className)) {
                el.className += ' ' + className;
            }
        }
    }
    dt.addClass = addClass;
    function hasClass(el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        }
        else {
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }
    }
    dt.hasClass = hasClass;
    function toggleClass(el, className, value) {
        if (value === void 0) { value = !hasClass(el, className); }
        if (value) {
            addClass(el, className);
        }
        else {
            removeClass(el, className);
        }
    }
    dt.toggleClass = toggleClass;
    function preventDefault(event) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        else if (window.event && 'returnValue' in window.event) {
            window.event.returnValue = false;
        }
    }
    dt.preventDefault = preventDefault;
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    function scrollTop() {
        return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
    }
    dt.scrollTop = scrollTop;
})(dt || (dt = {}));
var dt;
(function (dt) {
    dt.ieVersion = (function () {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
        return false;
    })();
    dt.toggleClass(document.documentElement, 'is-ie', !!dt.ieVersion);
})(dt || (dt = {}));
var dt;
(function (dt) {
    function wbrize(value) {
        return value.split('/').join('/<wbr>');
    }
    dt.wbrize = wbrize;
})(dt || (dt = {}));
var dt;
(function (dt) {
    dt.transformStyle;
    dt.transitionStyle;
    dt.transitionEndEvent;
    dt.hasPositionSticky;
    var el;
    var prefixes = ['MS', 'Webkit', 'Moz', 'O'];
    function withDummyElement(callback) {
        if (el) {
            return callback(el);
        }
        else {
            el = document.createElement('div');
            document.body.insertBefore(el, null);
            var result = callback(el);
            document.body.removeChild(el);
            el = void 0;
            return result;
        }
    }
    dt.withDummyElement = withDummyElement;
    function getPrefixedStyle(name) {
        return withDummyElement(function (el) {
            if (name in el.style)
                return name;
            name = name.substr(0, 1).toUpperCase() + name.substr(1);
            for (var _i = 0; _i < prefixes.length; _i++) {
                var prefix = prefixes[_i];
                var prefixed = prefix + name;
                if (prefixed in el.style)
                    return prefixed;
            }
            return null;
        });
    }
    dt.getPrefixedStyle = getPrefixedStyle;
    function getPrefixedEvent(styleName, fallback, mapping) {
        if (styleName in mapping) {
            return mapping[styleName];
        }
        else {
            return fallback;
        }
    }
    dt.getPrefixedEvent = getPrefixedEvent;
    function isValueSupported(name, value) {
        return withDummyElement(function (el) {
            try {
                if (!(name in el.style))
                    return false;
                el.style[name] = value;
                return el.style[name] == value;
            }
            catch (e) {
                return false;
            }
        });
    }
    dt.isValueSupported = isValueSupported;
    withDummyElement(function () {
        dt.hasPositionSticky = isValueSupported('position', 'sticky') || isValueSupported('position', '-webkit-sticky');
        dt.transformStyle = getPrefixedStyle('transform');
        dt.transitionStyle = getPrefixedStyle('transition');
        dt.transitionEndEvent = getPrefixedEvent(dt.transitionStyle, 'transitionend', {
            'OTransition': 'otransitionend',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        });
    });
})(dt || (dt = {}));
var dt;
(function (dt) {
    var Application = (function () {
        function Application() {
            if (console && console.log) {
                console.log('\n\nShow your stuff at https://github.com/DefinitelyTyped/definitelytyped.github.io\n\n');
            }
            _(document.querySelectorAll('.dt-header')).each(function (el) {
                new dt.navigation.Component({ el: el });
            });
            _(document.querySelectorAll('.dt-menu')).each(function (el) {
                new dt.menu.Component({ el: el });
            });
            _(document.querySelectorAll('.dt-repository-search')).each(function (el) {
                new dt.repository.Component({ el: el });
            });
            _(document.querySelectorAll('.dt-header-stars')).each(function (el) {
                new dt.stars.Component({ el: el });
            });
        }
        return Application;
    })();
    dt.Application = Application;
    dt.app = new Application();
})(dt || (dt = {}));
