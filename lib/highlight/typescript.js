/*
 Language: TypeScript
 Requires: ????
 Author: ????
 Contributors: Bart van der Schoor <bartvanderschoor@gmail.com>
 Description: Highlighter for TypeScript crudely based on shipped JavaScript and ActionScript highlighters
 */

// TODO finish work in progress

module.exports = function (hljs) {
	var IDENT_RE = '[a-zA-Z_$][a-zA-Z0-9_$]*';
	var IDENT_FUNC_RETURN_TYPE_RE = '([*]|[a-zA-Z_$][a-zA-Z0-9_$]*)';

	var AS3_REST_ARG_MODE = {
		className: 'rest_arg',
		begin: '[.]{3}', end: IDENT_RE,
		relevance: 10
	};

	return {
		aliases: ['ts'],
		keywords: {
			keyword: 'in if for while finally var new function do return void else break catch ' +
				'instanceof with throw case default try this switch continue typeof delete ' +
				'let yield const class interface module declare import export ',
			literal: 'true false null undefined NaN Infinity',
			built_in: 'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
				'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
				'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
				'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
				'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
				'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require'
		},
		contains: [
			{
				className: 'pi',
				begin: /^\s*('|")use strict('|")/,
				relevance: 10
			},
			hljs.APOS_STRING_MODE,
			hljs.QUOTE_STRING_MODE,
			hljs.C_LINE_COMMENT_MODE,
			hljs.C_BLOCK_COMMENT_MODE,
			hljs.C_NUMBER_MODE,
			{ // "value" container
				begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
				keywords: 'return throw case',
				contains: [
					hljs.C_LINE_COMMENT_MODE,
					hljs.C_BLOCK_COMMENT_MODE,
					hljs.REGEXP_MODE,
					{ // E4X
						begin: /</, end: />;/,
						relevance: 0,
						subLanguage: 'xml'
					}
				],
				relevance: 0
			},
			{
				className: 'class',
				beginKeywords: 'class interface', end: '{',
				contains: [
					{
						beginKeywords: 'extends implements'
					},
					hljs.TITLE_MODE
				]
			},
			{
				className: 'function',
				beginKeywords: 'function', end: '[{;]',
				illegal: '\\S',
				contains: [
					hljs.TITLE_MODE,
					{
						className: 'params',
						begin: '\\(', end: '\\)',
						contains: [
							hljs.APOS_STRING_MODE,
							hljs.QUOTE_STRING_MODE,
							hljs.C_LINE_COMMENT_MODE,
							hljs.C_BLOCK_COMMENT_MODE,
							AS3_REST_ARG_MODE
						]
					},
					{
						className: 'type',
						begin: ':',
						end: IDENT_FUNC_RETURN_TYPE_RE,
						relevance: 10
					}
				]
			},
			{
				begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
			},
			{
				begin: '\\.' + hljs.IDENT_RE, relevance: 0 // hack: prevents detection of keywords after dots
			}
		]
	};
};
