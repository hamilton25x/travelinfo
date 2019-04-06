var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var autoprefixer = require('autoprefixer')
var browserSync = require('browser-sync').create()
let cleanCSS = require('gulp-clean-css')
var minimist = require('minimist')
var gulpSequence = require('gulp-sequence')
request = require('request-json')
var client = request.createClient('http://data.ntpc.gov.tw/od/data/')

var envOptions = {
  string: 'env',
  default: { env: 'develop' }
}
var options = minimist(process.argv.slice(2), envOptions)

gulp.task('clean', function() {
  return gulp.src('./dist', { read: false }).pipe($.clean())
})

gulp.task('pug', function() {
  client.get('api/A886239B-D7C1-4309-870F-E0F64D088025?$format=json', function(
    err,
    res,
    body
  ) {
    gulp
      .src('./src/*.pug')
      .pipe($.plumber())
      .pipe(
        $.data(function() {
          var menu = require('./src/data/menu.json')
          var carousel = require('./src/data/carousel.json')
          var taichungData = require('./src/data/taichungData.json')
          var taichungArea = require('./src/data/taichungArea.json')
          var source = {
            menu: menu,
            carousel: carousel,
            taichungData: taichungData,
            taichungArea: taichungArea,
            newtaipeiData: body
          }
          return source
        })
      )
      .pipe(
        $.if(
          options.env === 'production',
          $.pug({
            pretty: false
          }),
          $.pug({
            pretty: true
          })
        )
      )
      .pipe(gulp.dest('./dist'))
      .pipe(browserSync.stream())
  })
})
$.watch(['./src/**/*.pug'], function() {
  gulp.start('pug')
})

gulp.task('vendorJs', function() {
  return gulp
    .src([
      './node_modules/jquery/dist/jquery.slim.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      './node_modules/lightbox2/dist/js/lightbox-plus-jquery.min.js'
    ])
    .pipe($.concat('vendors.js'))
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('sass', function() {
  var plugins = [autoprefixer({ browsers: ['last 1 version', '> 5%'] })]
  return gulp
    .src('./src/sass/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass({
        outputStyle: 'nested',
        includePaths: ['./node_modules/bootstrap/scss']
      }).on('error', $.sass.logError)
    )
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === 'production', cleanCSS()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
})
$.watch(['./src/sass/**/*.scss'], function() {
  gulp.start('sass')
})

gulp.task('babel', () =>
  gulp
    .src('./src/js/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      $.babel({
        presets: ['@babel/env']
      })
    )
    .pipe($.concat('all.js'))
    .pipe(
      $.if(
        options.env === 'production',
        $.uglify({
          compress: {
            drop_console: true
          }
        })
      )
    )
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream())
)
$.watch(['src/js/**/*.js'], function() {
  gulp.start('babel')
})

gulp.task('imagemin', () =>
  gulp
    .src('./src/images/**/*')
    .pipe($.if(options.env === 'production', $.imagemin()))
    .pipe(gulp.dest('./dist/images'))
)

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './dist'
    },
    reloadDebounce: 2000
  })
})

gulp.task('deploy', function() {
  return gulp.src('./dist/**/*').pipe($.ghPages())
})

gulp.task(
  'bulid',
  gulpSequence('clean', 'pug', 'sass', 'babel', 'vendorJs', 'imagemin')
)

gulp.task('default', [
  'pug',
  'sass',
  'babel',
  'vendorJs',
  'imagemin',
  'browser-sync'
])
