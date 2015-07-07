
var hljs;

module.exports = {
	gfm: true,
	highlight: function (code, lang) {
        if (!hljs) {
            hljs = require('highlight.js');
            hljs.configure({tabReplace: '    '}); // 4 spaces
            hljs.registerLanguage('typescript', require('./highlight/typescript'));
        }
        if (lang) {
            return hljs.highlight(lang, code).value;
        }
        return hljs.highlightAuto(code).value;
    }
};
