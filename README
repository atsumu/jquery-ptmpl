================================================================
 ABOUT
================================================================

jquery-ptmpl is a fast flexible template engine (semi compatible
with jquery-tmpl).



================================================================
 API REFERENCE
================================================================

jQuery.fn.ptmpl(data, option)

 same as jQuery.fn.tmpl.
 >> Render the specified HTML content as a template, using the specified data.

 sample:

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


jQuery.ptmplDefineTag(map)

 add user-defined tag.

 sample:

  <script>
    jQuery.ptmplDefineTag({
      '=': function (code, str) {
          code.push('_PTMPL_HTML.push(_PTMPL_ESCAPE_HTML((', str, ')));');
      },
      'if': function (code, str) {
          code.push('if (', str, ') {');
      },
      'else': el = function (code, str) {
          if (str) {
              code.push('} else if (', str, ') {');
          } else {
              code.push('} else {');
          }
      },
      '/if': function (code, str) {
          code.push('}');
      }});
  </script>



================================================================
 TAG REFERENCE
================================================================

all tags are compatible with jquery-tmpl.

{{html  ...}}: output raw html string. (not escaped)
{{=     ...}}: output value. (html escaped)
{{~     ...}}: output value. (url encoded)

{{$     ...}}: execute javascript code.
{{!     ...}}: comment.

{{if    ...}}: if.
{{else  ...}}: else.
{{/if   ...}}: close if.

{{each  ...}}: each.
{{/each ...}}: close each.
{{break    }}: break.
{{continue }}: continue.

{{tmpl(<data> [, <option>]) ...}}: embed other template.



================================================================
 SAMPLE CODE
================================================================

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
