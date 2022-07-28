# quill-raw-html-edit
Quill.js Module which allows you to quickly view/edit the raw HTML in the editor

## Instalation
`npm i @roel.id/quill-raw-html-edit`

## Quickstart (Javascript)

``` html
<script src="/js/quill-raw-html-edit.js"></script>
```

``` js
Quill.register("modules/EditHtml", EditHtml);
const quill = new Quill(editor, {
  // ...
  modules: {
    // ...
    htmlEditButton: {}
  }
});
```