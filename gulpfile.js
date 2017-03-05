var gulp = require('gulp');
var runSeq = require('run-sequence');

gulp.task('heroku:production', function(){
  runSeq('clean', 'build', 'minify')
});

gulp.task('default', function () { console.log('Hello Gulp!') });