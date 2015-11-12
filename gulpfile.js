var gulp = require('gulp');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minify = require('gulp-minify');

var dirs = {
  src: {
    scss: './src/stylesheets/*.scss',
    js: "./src/javascripts/**/*.js",
    html: "./src/templates/***/**/*.html"
  },
  dist: {
    css: './public/css',
    js: './public/js',
    html: './public/html'
  }
};

gulp.task('sass', function(){
  return gulp.src(dirs.src.scss)
    .pipe(sass())
    .pipe(gulp.dest(dirs.dist.css));
});

gulp.task('scripts', function(){
  return gulp.src(dirs.src.js)
    .pipe(concat('all.js'))
    .pipe(gulp.dest(dirs.dist.js))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dirs.dist.js))
});

gulp.task('html', function(){
  return gulp.src(dirs.src.html)
    .pipe(gulp.dest(dirs.dist.html));
});

gulp.task('watch', function(){
  gulp.watch(dirs.src.js, ['scripts']);
  gulp.watch(dirs.src.scss, ['sass']);
  gulp.watch(dirs.src.html, ['html']);
});

gulp.task('default', ['watch', 'sass', 'scripts', 'html']);
