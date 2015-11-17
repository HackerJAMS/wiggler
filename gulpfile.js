var gulp = require('gulp');

/***

Compile SCSS to CSS.
CSS Linting.
**Autoprefixing.
Concatenate all CSS files into one.
Minify the CSS.
Rename the file for production.


watch for changes to client files
build

***/

var prefix  = require('gulp-autoprefixer');
var concat  = require('gulp-concat');
var csslint = require('gulp-csslint');
var jshint  = require('gulp-jshint');
var cssmin  = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var open    = require('gulp-open');
var rename  = require('gulp-rename');
var sass    = require('gulp-sass');
var uglify  = require('gulp-uglify');
var mocha = require('gulp-mocha');

var browserify = require('browserify')
var source = require('vinyl-source-stream')
var browserSync = require('browser-sync');

gulp.task('scss', function(){
  return gulp.src('client/src/styles/scss/styles.scss')
  .pipe(sass())
  .pipe(rename('styles.css'))
  .pipe(gulp.dest('client/dist/css'))
   .pipe(browserSync.stream());
});

gulp.task('scripts', function(){
  return gulp.src('client/app/src/scripts/*.js')
  .pipe(jshint())
  .pipe(concat('scripts.js'))
  .pipe(uglify())
  .pipe(gulp.dest('client/app/dist/js'))
});

// gulp.task('browserify', function() {
//     // Grabs the app.js file
//     return browserify('client/src/scripts/app.js')
//         // bundles it and creates a file called main.js
//         .bundle()
//         .pipe(source('main.js'))
//         // saves it the public/js/ directory
//         .pipe(gulp.dest('client/dist/js'));
// })

// start the server
gulp.task('nodemon', function (cb) {

  var started = false;

  return nodemon({
    script: 'server/server.js'
  }).on('start', function () {
    // to avoid nodemon being started multiple times
    if (!started) {
      cb();
      started = true;
    }
  });
});

// auto-refresh page
gulp.task('browser-sync', ['nodemon'], function() {
  browserSync({
    notify: true,
    injectChanges: true,
    files: ["client/dist/css/*.css", "client/dist/js/*.js"],
    proxy: 'localhost:3000',
    port: 3001
  });
});

gulp.task('test', function(){
  return gulp.src('test/spec.js', {read : false})
  .pipe(mocha({reporter : 'nyan'}))
});

// open the app in default browser
gulp.task('app', function(){
  var options = {
    uri: 'http://localhost:3000'
  };
  gulp.src("")
  .pipe(open(options));

});

gulp.task('default', ['scss', 'browser-sync'], function () {
    gulp.watch("client/src/styles/scss/**/*.scss", ['scss']);
});
