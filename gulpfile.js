var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var less = require('gulp-less');
var minifyCSS = require('gulp-csso');
var paths = {
    pages: ['src/*.html']
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task('css', function(){
    return gulp.src('src/*.less')
      .pipe(less())
      .pipe(minifyCSS())
      .pipe(gulp.dest('dist'))
});

gulp.task("default", ["copy-html", "css"], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/index.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("dist"));
});
