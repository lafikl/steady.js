'use strict';

var gulp  = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('scripts', function () {
  return gulp.src('Steady.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter(require('jshint-stylish')))
    .pipe($.size());
});

gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({ port: 35729 }))
    .use(connect.static(__dirname))
    .use(connect.static('tests'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect'], function () {
  require('opn')('http://localhost:9000/tests/test.html');
});

gulp.task('watch', ['connect', 'serve'], function () {
  var server = $.livereload();

  // watch for changes

  gulp.watch([
    'Steady.js',
    'tests/*.html',
    'tests/*.js'
  ]).on('change', function (file) {
    server.changed(file.path);
  });

  gulp.watch('Steady.js', ['scripts']);
});


gulp.task('build', function() {
  return gulp.src('Steady.js')
    .pipe($.uglify())
    .pipe($.rename('Steady.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('test', ['watch']);

gulp.task('default', ['build']);