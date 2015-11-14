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

var sass    = require('gulp-sass');
var concat  = require('gulp-concat');
var rename  = require('gulp-rename');
var cssmin  = require('gulp-minify-css');
var csslint = require('gulp-csslint');
var prefix  = require('gulp-autoprefixer');

var jshint  = require('gulp-jshint');
var uglify  = require('gulp-uglify');

gulp.task('default', function(){

});

gulp.task('scss', function(){
  return gulp.src('client/app/src/styles/scss/styles.scss')
  .pipe(sass())
  .pipe(rename('styles.css'))
  .pipe(gulp.dest('client/app/dist/css'))
});

gulp.task('scripts', function(){
  return gulp.src('client/app/src/scripts/*.js')
  .pipe(jshint())
  .pipe(concat('scripts.js'))
  .pipe(uglify())
  .pipe(gulp.dest('client/app/dist/js'))
});

