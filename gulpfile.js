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

var browserify = require('browserify')
var source = require('vinyl-source-stream')

gulp.task('scss', function(){
  return gulp.src('client/app/src/styles/scss/styles.scss')
  .pipe(sass())
  .pipe(rename('styles.css'))
  .pipe(gulp.dest('client/app/dist/css'))
});

// gulp.task('scripts', function(){
//   return gulp.src('client/app/src/scripts/*.js')
//   .pipe(jshint())
//   .pipe(concat('scripts.js'))
//   .pipe(uglify())
//   .pipe(gulp.dest('client/app/dist/js'))
// });

gulp.task('browserify', function() {
    // Grabs the app.js file
    return browserify('client/src/scripts/app.js')
        // bundles it and creates a file called main.js
        .bundle()
        .pipe(source('main.js'))
        // saves it the public/js/ directory
        .pipe(gulp.dest('client/app/dist/js'));
})


// start the server
gulp.task('start', function() {
  nodemon()
});

// open the app in default browser
gulp.task('app', function(){
  var options = {
    uri: 'http://localhost:3000'
  };
  gulp.src("")
  .pipe(open(options));
});

gulp.task('default', ['start', 'app']);
