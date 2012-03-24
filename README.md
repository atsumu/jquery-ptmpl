# jQuery Pluggable Templates Plugin

## About

jquery-ptmpl is a fast flexible template engine (semi compatible with jquery-tmpl).


## API Reference

### jQuery.fn.ptmpl(data, option)

same as jQuery.fn.tmpl.

>> Take the first element in the matched set and render its content as a template, using the specified data.

#### sample
```html
<div id="place"></div>
<script id="tmpl-foo" type="text/x-jquery-tmpl">
  {{each(k, v) a}}
    <div>{{= k}}: {{= v}}</div>
  {{/each}}
</script>
<script>
  jQuery(function ($) {
    $("#tmpl-foo").ptmpl({ a:[1,2,3] }).appendTo("#place");
  });
</script>
```


### jQuery.ptmpl(str, data, option)

same as jQuery.tmpl.

>> Render the specified HTML content as a template, using the specified data.

#### sample
```html
<div id="place"></div>
<script>
  jQuery(function ($) {
    jQuery.ptmpl('a: {{= a}}', { a:3 }).appendTo("#place");
  });
</script>
```


### jQuery.ptmplDefineTag(map)

define tamplate tag.

matched to regexp /[^\s(]/ characters are avalable for key.

#### sample
```html
<script>
  jQuery.ptmplDefineTag({
    '=': function (code, str, option) {
        code.push('_PTMPL_HTML.push(jQuery.ptmplEscapeHtml((', str, ')));');
    },
    'if': function (code, str, option) {
        code.push('if (', str, ') {');
    },
    'else': el = function (code, str, option) {
        if (str) {
            code.push('} else if (', str, ') {');
        } else {
            code.push('} else {');
        }
    },
    '/if': function (code, str, option) {
        code.push('}');
    }});
</script>
```


### jQuery.ptmplUndefineTag(list)

undefine template tag.

#### sample
```html
<script>
  jQuery.ptmplUndefineTag(['if', 'else', '/if']);
</script>
```


### jQuery.ptmplCompile(text, option)

compile text to function.

if option.debug is true value, output compiled code to console.log.


### jQuery.ptmplGetCompiled(elem, option)

get compiled code with using cache.

cache key is elem.id.

if elem.id is false value, cache is not used.

if elem.id is found in cache, returns compiled code from cache (with no re-compile). 

else, compiles elem.innerHTML and returns compiled code.

option is same as jQuery.ptmplCompile.


### jQuery.ptmplEscapeHtml(str)

escape for html.

(`&`, `<`, `>`, `"`, `'` to `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#039;`)


### jQuery.ptmplUnescapeHtml(str)

unescape for html.

(`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#039;` to `&`, `<`, `>`, `"`, `'`)


### jQuery.ptmplEscapeUrl(str)

escape for url.

same as encodeURIComponent.


### jQuery.ptmplTranslateHtmlToLiteral(str)

translate raw html to string literal, for embedding to compiled code.

`\\`, `\r?\n`, `"`, `'` to `\\\\`, `\\n`, `\"`, `\'` and remove indent tabs.

removed character is tab only. spaces not removed.


### jQuery.ptmplScope(map)

create new scope for preventing to overwrite variable.

```javascript
var scope = { a:1 }
with (scope) {
	var a = 2;
}
// scope.a == 2 at here.
with (jQuery.ptmplScope(scope)) {
	var a = 3;
}
// scope.a == 2 at here (not 3).
```


### jQuery.ptmplCache

cached templates object.

the key is id attribute of script tag.

the value is compiled template function.


### jQuery.ptmplTagTable

defined template tag table object.

the key is template tag keyword.

the value is translate function.


## Template Tag Reference

tags are semi-compatible with jquery-tmpl.

### {{html < exp >}}

output < exp > result as raw html string. (not escaped)


### {{= < exp >}}

output < exp > result as text. (html escaped)


### {{~ < exp >}}

output < exp > result. (url encoded)


### {{$ < code >}}

embed javascript < code >.

requires `;` at end of sentence, because codes are joined to 1 line.

#### sample
```html
<script id="sample" type="text/x-jquery-ptmpl">
  {{$ var x = a.slice(0, 2); }}
  {{$ try { }}
    {{$ console.log(x); }}
  {{$ } catch (e) { }}
    {{$ alert("error"); }}
  {{$ } }}
</script>
```


### {{! ...}}, {{// ...}}

comment.

{{! ...}} is defined for compatibility to jquery-tmpl.


### {{if < exp >}} ... {{else [< exp >]}} ... {{/if}}

if ... else ... end.


### {{tryif < exp >}} ... {{catchelse [< exp >]}} ... {{/tryif}}

try < exp > and if the result is true value, then execute trailing clause.

if the result is false value or exception is thrown, then evaluate next catchelse < exp >.

#### sample
```html
<div id="place"></div>
<script id="sample" type="text/x-jquery-tmpl">
  {{tryif a.b.length >= 1}}
    here is not executed, because `a.b` is undefined and thrown exception.
  {{catchelse a.c.length >= 1}}
    here is not executed, because not `a.c.length >= 1`.
  {{catchelse a.d.length >= 1}}
    here is not executed, because `a.d` is undefined and thrown exception.
  {{catchelse a.e.length >= 1}}
    here is executed.
  {{catchelse}}
    here is not executed.
  {{/tryif}}
</script>
<script>
  jQuery(function ($) {
    $("#sample").ptmpl({ a:{ c:[], e:[1,2,3] } }).appendTo("#place");
  });
</script>
```


### {{for < exp1 >; < exp2 >; < exp3 >}} ... {{/for}}

simple "for" loop.


### {{each(< k >, < v >) < exp >}} ... {{/each}}, {{break}}, {{continue}}

same as jQuery.each(< exp >, function (< k >, < v >) { ... }).

always < k > and < v > required.


### {{tmpl(< data > [, < option >]) < exp >}}

call other template with < data > and < option >.

< exp > result is used for selector.


### {{strip}} ... {{/strip}}

remove newline and line head tab characters from template code.
it works at compile-time.


## Sample Code

```html
<div id="place"></div>

<script id="tmpl-sample" type="text/x-jquery-tmpl">

  <h2>this is sample.</h2>

  {{! you can use template local variable. }}
  {{$ var foo = '<span style="color:red">output raw html</span>'; }}
  {{html foo}}

  {{each(k, v) a}}
    {{if v % 2 == 0}}
      {{continue}}
    {{else v % 3 == 0}}
      {{break}}
    {{else}}
      <div>k={{= k}}, v={{= v}}</div>
    {{/if}}
  {{/each}}

  {{tmpl({ b:3 }) "#tmpl-other"}}

</script>

<script id="tmpl-other" type="text/x-jquery-tmpl">
  here is other template. {{= b}}
</script>

<scirpt>
  jQuery(function ($) {
    $("#tmpl-sample").ptmpl({ a:[1,2,3,4] }).appendTo("#place");
  });
</script>
```
