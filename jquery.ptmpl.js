/*!
 * jQuery Pluggable Templates Plugin 1.0.1
 * http://github.com/atsumu/jquery-ptmpl
 * Requires jQuery 1.4.2
 *
 * Copyright Atsumu Tanaka.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function (jQuery, undefined) {

var _PTMPL_CACHE = {};
var _PTMPL_TAGTABLE = {};

var _PTMPL_HELPER = {
	_PTMPL_CACHE: _PTMPL_CACHE,
	_PTMPL_TAGTABLE: _PTMPL_TAGTABLE,
	_PTMPL_ESCAPE_HTML: _PTMPL_ESCAPE_HTML,
	_PTMPL_SCOPE: _PTMPL_SCOPE };

// jquery extension.
jQuery.fn.ptmpl = ptmplFn;

// export for plugin.
jQuery.ptmplGetCompiled = ptmplGetCompiled;
jQuery.ptmplCompile = ptmplCompile;
jQuery.ptmplDefineTag = ptmplDefineTag;
jQuery.ptmplEscapeHtml = _PTMPL_ESCAPE_HTML;
jQuery.ptmplUnescapeHtml = _PTMPL_UNESCAPE_HTML;
jQuery.ptmplEscapeStringLiteral = _PTMPL_ESCAPE_STRING_LITERAL;

// helper function.
function _PTMPL_ESCAPE_HTML(str) {
	return (str ? str.toString() : ""+str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\"/g, '&quot;')
		.replace(/\'/g, '&#039;');
}

function _PTMPL_UNESCAPE_HTML(str) {
	return str.toString()
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

function _PTMPL_ESCAPE_STRING_LITERAL(str) {
	return str
		.replace(/\\/g, '\\\\')
		.replace(/\r?\n\t*/g, '\\n')
		.replace(/\'/g, "\\'")
		.replace(/\"/g, '\\"');
}

function _PTMPL_SCOPE(map) {
	function scope() {}
	scope.prototype = map;
	return new scope;
}

//
function ptmplFn(data, option) {
	var text = jQuery.ptmplGetCompiled(this[0], option)(_PTMPL_HELPER, option, data);
	var el = document.createElement('div');
	el.innerHTML = text;
	return jQuery(jQuery.makeArray(el.childNodes));
}

function ptmplGetCompiled(elem, option) {
	var id = elem.id;
	if (id in _PTMPL_CACHE) {
	} else {
		_PTMPL_CACHE[id] = jQuery.ptmplCompile(elem.innerHTML, option);
	}
	return _PTMPL_CACHE[id];
}

function ptmplDefineTag(map) {
	jQuery.each(map, function (key, proc) {
		_PTMPL_TAGTABLE[key] = proc;
	});
};

function ptmplCompile(text, option) {
	if (!option) option = {};
	var code = [];
	code.push('var _PTMPL_HTML = [];');
	code.push('with (_PTMPL_HELPER._PTMPL_SCOPE(_PTMPL_HELPER)) {');
	code.push('with (_PTMPL_HELPER._PTMPL_SCOPE(_PTMPL_ARG)) {');
	text.replace(/((?:a|[^a])*?)(?:\{\{((?:a|[^a])*?)\}\}|$)/g, function (all, html, tag) {
		if (html) {
			var line = jQuery.ptmplEscapeStringLiteral(html);
			code.push('_PTMPL_HTML.push("', line, '");');
		}
		if (tag) {
			tag.match(/([^\s\(]+)((?:a|[^a])*)/);
			var key = RegExp.$1;
			var str = RegExp.$2;
			_PTMPL_TAGTABLE[key](code, str, option);
		}
	});
	code.push('}');
	code.push('}');
	code.push('return _PTMPL_HTML.join("");');
	var joined = code.join('');
	if (option.debug) {
		console.log('code:', joined);
	}
	try {
		var tmpl = new Function('_PTMPL_HELPER', '_PTMPL_OPTION', '_PTMPL_ARG', joined);
	} catch (e) {
		console && console.log('syntax error:', joined, e);
		throw e;
	}
	return tmpl;
}

// define tag.
jQuery.ptmplDefineTag({
	// not escaped output
	'html': function (code, str) {
		code.push('_PTMPL_HTML.push((', str, '));');
	},
	// html escaped output
	'=': function (code, str) {
		code.push('_PTMPL_HTML.push(_PTMPL_ESCAPE_HTML((', str, ')));');
	},
	// url escaped output
	'~': function (code, str) {
		code.push('_PTMPL_HTML.push(encodeURIComponent((', str, ')));');
	},
	// evaluate
	'$': function (code, str) {
		code.push(str);
	},
	// comment
	'!': function (code, str) {
	},
	'//': function (code, str) {
	}});

var el;
jQuery.ptmplDefineTag({
	'if': function (code, str) {
		code.push('if (', str, ') {');
	},
	'el': el = function (code, str) {
		if (str) {
			code.push('} else if (', str, ') {');
		} else {
			code.push('} else {');
		}
	},
	'else': el,
	'/if': function (code, str) {
		code.push('}');
	}});

jQuery.ptmplDefineTag({
	'each': function (code, str) {
		var m = str.match(/\s*\((?:\s*(\w+)\s*(?:,\s*(\w+)\s*))\)\s*((?:a|[^a])+)/);
		if (m == null) {
			throw 'ptmpl syntax error: near {{each'+m+'}}';
		}
		var key = RegExp.$1;
		var val = RegExp.$2;
		var exp = RegExp.$3;
		code.push('jQuery.each((', exp, '), function (', key, ',', val, ') {');
	},
	'/each': function (code, str) {
		code.push('});');
	},
	'continue': function (code, str) {
		code.push('return true;');
	},
	'break': function (code, str) {
		code.push('return false;');
	}});

jQuery.ptmplDefineTag({
	'tmpl': function (code, str) {
		var m = str.match(/\s*\(((?:a|[^a])*?)\)\s*((?:a|[^a])+)/); // TODO: fix imperfect matching
		if (m == null) {
			throw 'ptmpl syntax error: near {{tmpl'+m+'}}';
		}
		var arg = RegExp.$1 || '{}';
		var selector = RegExp.$2;
		// optimization, avoid jQuery.find() if simple id selector.
		var id = selector.match(/^\s*['"]#(.+?)["']\s*$/) && RegExp.$1;
		if (id) {
			code.push('_PTMPL_HTML.push(jQuery.ptmplGetCompiled(document.getElementById("', id, '"), _PTMPL_OPTION)(_PTMPL_HELPER, _PTMPL_OPTION, (', arg, ')));');
		} else {
			code.push('_PTMPL_HTML.push(jQuery.ptmplGetCompiled(jQuery.find((', selector, '))[0], _PTMPL_OPTION)(_PTMPL_HELPER, _PTMPL_OPTION, (', arg, ')));');
		}
	}});

})(jQuery);
