// jquery-ptmpl plugin for static compile mode.
(function ($, undefined) {

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
			throw 'ptmpl syntax error: {{tmpl}} only accepts simple id selector on static compile mode.';
		}
	}});

})(window.jQuery || window.Zepto);
