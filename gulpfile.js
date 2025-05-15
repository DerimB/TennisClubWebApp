const gulp = require("gulp");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const htmlmin = require("gulp-htmlmin");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");

// Paths
const paths = {
  html: "frontend/html/**/*.html",
  styles: "frontend/styles/**/*.css",
  scripts: "frontend/js/**/*.js",
  assets: "frontend/assets/**/*"
};

// Minify HTML
gulp.task("html", () => {
  return gulp.src(paths.html)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist/html"));
});

// Minify and copy CSS
gulp.task("styles", () => {
  return gulp.src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/styles"));
});

// Minify and copy JS
gulp.task("scripts", () => {
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/js"));
});

// Copy assets
gulp.task("assets", () => {
  return gulp.src(paths.assets)
    .pipe(gulp.dest("dist/assets"));
});

// Watch files
gulp.task("watch", () => {
  gulp.watch(paths.html, gulp.series("html"));
  gulp.watch(paths.styles, gulp.series("styles"));
  gulp.watch(paths.scripts, gulp.series("scripts"));
  gulp.watch(paths.assets, gulp.series("assets"));
});

// Default
gulp.task("default", gulp.series("html", "styles", "scripts", "assets", "watch"));

const browserSync = require('browser-sync').create();

// Add this at the bottom of your gulpfile.js
gulp.task('serve', function () {
browserSync.init({
  server: {
    baseDir: "frontend"
  },
  startPath: "/html/index.html"  // Or whichever page you want to open first
});


  gulp.watch('frontend/**/*.html').on('change', browserSync.reload);
  gulp.watch('frontend/styles/**/*.css').on('change', browserSync.reload);
  gulp.watch('frontend/js/**/*.js').on('change', browserSync.reload);
});

