
# quill-raw-html-edit

![npm (scoped)](https://img.shields.io/npm/v/@roel.id/quill-raw-html-edit?style=plastic)
![NPM](https://img.shields.io/npm/l/@roel.id/quill-raw-html-edit?style=plastic)
![npm](https://img.shields.io/npm/dm/@roel.id/quill-raw-html-edit?style=plastic)

Quill.js Module which allows you to quickly view/edit the raw HTML in the editor. Quick & simple, accepting any tags and attributes.

## Instalation
`npm i @roel.id/quill-raw-html-edit`

## Quickstart (Javascript)

``` html
<script src="/js/quill-raw-html-edit.min.js"></script>
```

``` js
Quill.register("modules/EditHtml", EditHtml);
const quill = new Quill(editor, {
  // ...
  modules: {
    // ...
    EditHtml: {}
  }
});
```