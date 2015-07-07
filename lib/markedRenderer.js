module.exports = {
    code: function(code, lang, escaped) {
        if (this.options.highlight) {
            var out = this.options.highlight(code, lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
        }
    
        if (!lang) {
            return '<pre><code>'
                + (escaped ? code : escape(code, true))
                + '\n</code></pre>';
        }
    
        return '<pre><code class="'
            + this.options.langPrefix
            + escape(lang, true)
            + '">'
            + (escaped ? code : escape(code, true))
            + '\n</code></pre>\n';
    },
    
    heading: function(text, level, raw) {
        return '<h'
            + level
            + ' id="'
            + this.options.headerPrefix
            + raw.toLowerCase().replace(/[^\w]+/g, '-')
            + '"  class="ui header">'
            + text
            + '</h'
            + level
            + '>\n';
    },
    
    hr: function() {
        return '<div class="ui divider"></div>\n';
    },
    
    list: function(body, ordered) {
        if (ordered) {
            return '<div class="ui ordered list">' + body + '</div>';
        }
        return '<div class="ui list">' + body + '</div>';
    },
    
    listitem: function(text) {
        return '<div class="ui item">' + text + '</div>\n';
    },
    
    table: function(header, body) {
        return '<table class="ui table">\n'
            + '<thead>\n'
            + header
            + '</thead>\n'
            + '<tbody>\n'
            + body
            + '</tbody>\n'
            + '</table>\n';
    }
};