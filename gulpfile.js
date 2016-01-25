const gulp = require('gulp');
const browserify = require('gulp-browserify');
const rename = require('gulp-rename');

gulp.task('browserify', () => {
  gulp.src('src/index.js')
    .pipe(browserify())
    .on('error', () => {})
    .pipe(rename('drone_controller.js'))
    .pipe(gulp.dest('base'));
});

gulp.task('watch', ['build'], () => {
  gulp.watch('src/**/*', ['browserify']);
});

gulp.task('build', ['browserify']);
