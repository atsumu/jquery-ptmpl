/*!
 * jQuery Pluggable Templates Plugin 1.2.0
 * http://github.com/atsumu/jquery-ptmpl
 * Requires jQuery 1.4.2
 *
 * Copyright Atsumu Tanaka.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function ($, undefined) {

// jquery extension.
$.fn.ptmpl = ptmplFn;
$.ptmpl = ptmplPtmpl;
$.ptmplStatic = ptmplStatic;

// export for plugin.
$.ptmplDefineTag = ptmplDefineTag;
$.ptmplUndefineTag = ptmplUndefineTag;
$.ptmplCompile = ptmplCompile;
$.ptmplGetCompiled = ptmplGetCompiled;
$.ptmplEscapeHtml = ptmplEscapeHtml;
$.ptmplUnescapeHtml = ptmplUnescapeHtml;
$.ptmplEscapeUrl = encodeURIComponent;
$.ptmplEscapeStringLiteral = ptmplEscapeStringLiteral;
$.ptmplTranslateHtmlToLiteral = ptmplEscapeStringLiteral;
$.ptmplMakeArray= $.makeArray || ptmplMakeArray;
$.ptmplScope = ptmplScope;
$.ptmplCache = $.ptmplCache || {};
$.ptmplTagTable = {};

function ptmplFn(data, option) {
	if (!$.isArray(data)) data = [data];
	var text = [];
	var template = this[0];
	var compiled = $.ptmplGetCompiled(template, option);
	$.each(data, function() {
		text.push(compiled(option, this));
	});
	var el = document.createElement('div');
	el.innerHTML = text.join('');
	return $($.ptmplMakeArray(el.childNodes));
}

function ptmplPtmpl(str, data, option) {
	return $.fn.ptmpl.apply([{ innerHTML:str }], [data, option]);
}

function ptmplStatic(id, data, option) {
	return $.fn.ptmpl.apply([{ id:id.replace('#', '') }], [data, option]);
}

function ptmplDefineTag(map) {
	$.each(map, function (key, proc) {
		$.ptmplTagTable[key] = proc;
	});
};

function ptmplUndefineTag(list) {
	$.each(list, function (i, key) {
		delete $.ptmplTagTable[key];
	});
};

function ptmplCompile(text, option, debugInfo) {
	if (!option) option = {};
	var code = [];
	if (!option.noDebugInfoOnExecute) code.push('try {\n');
	code.push('var _PTMPL_HTML = [];\n');
	code.push('with ($.ptmplScope(_PTMPL_ARG)) {\n');
	text.replace(/((?:a|[^a])*?)(?:\{\{((?:a|[^a])*?)\}\}|$)/g, function (all, html, tag) {
		if (html) {
			var line = $.ptmplTranslateHtmlToLiteral(html);
			if (line) code.push('_PTMPL_HTML.push("', line, '");\n');
		}
		if (tag) {
			tag.match(/([^\s\(]+)((?:a|[^a])*)/);
			var key = RegExp.$1;
			var str = RegExp.$2;
			$.ptmplTagTable[key](code, str, option);
		}
	});
	code.push('}\n');
	code.push('return _PTMPL_HTML.join("");');
	if (!option.noDebugInfoOnExecute) {
		code.push('\n} catch (e) {\n');
		code.push('throw new Error("RuntimeError in '+$.ptmplEscapeStringLiteral(debugInfo.id ? debugInfo.id : debugInfo.text.slice(0, 100))+', "+e.message);\n');
		code.push('}');
	}
	var joined = code.join('');
	if (option.debug) {
		console.log('code:', joined);
	}
	try {
		var tmpl = new Function('_PTMPL_OPTION', '_PTMPL_ARG', joined);
	} catch (e) {
		if (!option.noDebugInfoOnCompile) {
			e.message += ' in '+(debugInfo.id ? debugInfo.id : debugInfo.text.slice(0, 100));
		}
		throw e;
	}
	return tmpl;
}

function ptmplGetCompiled(elem, option) {
	var id = elem.id;
	var text = elem.innerHTML;
	if (id) {
		if (id in $.ptmplCache) return $.ptmplCache[id];
		if (text) return $.ptmplCache[id] = $.ptmplCompile(text, option, { id:"#"+id });
		text = document.getElementById(id).innerHTML;
		return $.ptmplCache[id] = $.ptmplCompile(text, option, { id:"#"+id });
	}
	return $.ptmplCompile(text, option, { text:text });
}

function ptmplEscapeHtml(str) {
	return (str ? str.toString() : ''+str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\"/g, '&quot;')
		.replace(/\'/g, '&#039;');
}

function ptmplUnescapeHtml(str) {
	return (str ? str.toString() : ''+str)
		.replace(/&#039;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&gt;/g, '>')
		.replace(/&lt;/g, '<')
		.replace(/&amp;/g, '&');
}

function ptmplEscapeStringLiteral(str) {
	return str
		.replace(/\\/g, '\\\\')
		.replace(/\r?\n\t*/g, '\\n')
		.replace(/\'/g, "\\'")
		.replace(/\"/g, '\\"');
}

function ptmplMakeArray(array) {
	return Array.prototype.slice.call(array, 0);
}

function ptmplScope(map) {
	function scope() {}
	scope.prototype = map;
	return new scope;
}

// define tags.
$.ptmplDefineTag({
	// not escaped output
	'html': function (code, str) {
		code.push('_PTMPL_HTML.push((', str, '));\n');
	},
	// html escaped output
	'=': function (code, str) {
		code.push('_PTMPL_HTML.push($.ptmplEscapeHtml((', str, ')));\n');
	},
	// url escaped output
	'~': function (code, str) {
		code.push('_PTMPL_HTML.push($.ptmplEscapeHtml($.ptmplEscapeUrl((', str, '))));\n');
	},
	// evaluate
	'$': function (code, str) {
		code.push(str, '\n');
	},
	// comment
	'!': function (code, str) {
	},
	'//': function (code, str) {
	}});

var el;
$.ptmplDefineTag({
	'if': function (code, str) {
		code.push('if (', str, ') {\n');
	},
	'el': el = function (code, str) {
		if (str) {
			code.push('} else if (', str, ') {\n');
		} else {
			code.push('} else {\n');
		}
	},
	'else': el,
	'/if': function (code, str) {
		code.push('}\n');
	}});

$.ptmplDefineTag({
	'tryif': function (code, str) {
		code.push('if ((function () { try { return (', str, '); } catch (e) {} })()) {\n');
	},
	'catchelse': el = function (code, str) {
		if (str) {
			code.push('} else if ((function () { try { return (', str, '); } catch (e) {} })()) {\n');
		} else {
			code.push('} else {\n');
		}
	},
	'/tryif': function (code, str) {
		code.push('}\n');
	}});

$.ptmplDefineTag({
	'for': function (code, str) {
		code.push('for (', str, ') {\n');
	},
	'/for': function (code, str) {
		code.push('}\n');
	}});

$.ptmplDefineTag({
	'each': function (code, str) {
		var m = str.match(/\s*\((?:\s*(\w+)\s*(?:,\s*(\w+)\s*))\)\s+((?:a|[^a])+)/);
		if (m == null) throw 'ptmpl syntax error: near {{each'+str+'}}';
		var key = RegExp.$1;
		var val = RegExp.$2;
		var exp = RegExp.$3;
		code.push('$.each((', exp, '), function (', key, ',', val, ') {\n');
	},
	'/each': function (code, str) {
		code.push('});\n');
	},
	'continue': function (code, str) {
		code.push('return true;\n');
	},
	'break': function (code, str) {
		code.push('return false;\n');
	}});

$.ptmplDefineTag({
	'tmpl': function (code, str) {
		var m = str.match(/\s*\(((?:a|[^a])*?)\)\s+((?:a|[^a])+)/); // TODO: fix imperfect matching
		if (m == null) throw 'ptmpl syntax error: near {{tmpl'+str+'}}';
		var arg = RegExp.$1 || '{}';
		var selector = RegExp.$2;
		// optimization, avoid $.find() if simple id selector.
		var id = selector.match(/^\s*['"]#(.+?)["']\s*$/) && RegExp.$1;
		if (id) {
			code.push('_PTMPL_HTML.push($.ptmplGetCompiled({ id:"', id, '" }, _PTMPL_OPTION)(_PTMPL_OPTION, (', arg, ')));\n');
		} else {
			code.push('_PTMPL_HTML.push($.ptmplGetCompiled($.find((', selector, '))[0], _PTMPL_OPTION)(_PTMPL_OPTION, (', arg, ')));\n');
		}
	}});

$.ptmplStripPluginTranslateFunctionStack = [];

$.ptmplDefineTag({
	'strip': function (code, str) {
		var old = $.ptmplTranslateHtmlToLiteral;
		$.ptmplStripPluginTranslateFunctionStack.push(old);
		$.ptmplTranslateHtmlToLiteral = function (html) {
			return old(html.replace(/\r?\n\t*/g, ''));
		};
	},
	'/strip': function (code, str) {
		$.ptmplTranslateHtmlToLiteral = $.ptmplStripPluginTranslateFunctionStack.pop();
	}});

})(window.jQuery || window.Zepto);
