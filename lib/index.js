var isBrowser = (typeof window !== 'undefined');
var Masonry = isBrowser ? window.Masonry || require('masonry') : null;

function MasonryMixin() {
    return function(reference, options) {
        return {
            masonry: false,

            domChildren: [],

            initializeMasonry: function(force) {
                if (!this.masonry || force) {
                    if (this.refs[reference]) {
                        this.masonry = new Masonry(this.refs[reference].getDOMNode(), options);
                        this.domChildren = this.getNewDomChildren();
                    }
                }
            },

            getNewDomChildren: function () {
                if (this.refs[reference]) {
                    var node = this.refs[reference].getDOMNode();
                    var children = options.itemSelector ? node.querySelectorAll(options.itemSelector) : node.children;

                    return Array.prototype.slice.call(children);
                } else {
                    return [];
                }
            },

            diffDomChildren: function() {
                var oldChildren = this.domChildren;
                var newChildren = this.getNewDomChildren();

                var removed = oldChildren.filter(function(oldChild) {
                    return !~newChildren.indexOf(oldChild);
                });

                var added = newChildren.filter(function(newChild) {
                    return !~oldChildren.indexOf(newChild);
                });

                var moved = [];

                if (removed.length === 0) {
                    moved = oldChildren.filter(function(child, index) {
                        return index !== newChildren.indexOf(child);
                    });
                }

                this.domChildren = newChildren;

                return {
                    old: oldChildren,
                    'new': newChildren, // fix for ie8
                    removed: removed,
                    added: added,
                    moved: moved
                };
            },

            performLayout: function() {
                if (this.masonry) {
                    var diff = this.diffDomChildren();

                    if (diff.removed.length > 0) {
                        this.masonry.remove(diff.removed);
                        this.masonry.reloadItems();
                    }

                    if (diff.added.length > 0) {
                        this.masonry.appended(diff.added);
                    }

                    if (diff.moved.length > 0) {
                        this.masonry.reloadItems();
                    }

                    this.masonry.layout();
                }
            },

            componentDidMount: function() {
                if (!isBrowser) return;

                this.initializeMasonry();
                this.performLayout();
            },

            componentDidUpdate: function() {
                if (!isBrowser) return;

                this.initializeMasonry();
                this.performLayout();
            },

            componentWillReceiveProps: function() {
                setTimeout(function() {
                    this.masonry.reloadItems();
                    this.forceUpdate();
                }.bind(this), 0);
            }
        };
    };
}

module.exports = MasonryMixin();
