var g = require('gulp');
var r = require('gulp-rename');
var u = require('gulp-terser');

g.task('minify', async function () {
  g.src(['quill-raw-html-edit.js']).pipe(u()).pipe(r('quill-raw-html-edit.min.js')).pipe(g.dest('./'));
})

g.task('default', g.series(['minify']));
