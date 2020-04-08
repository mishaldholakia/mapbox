const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const concat = require('gulp-concat');

gulp.task('start', function () {
  var stream = nodemon({
    exec: 'ts-node',
    script: 'server.ts',
    ext: 'yaml ts'
  });
})
