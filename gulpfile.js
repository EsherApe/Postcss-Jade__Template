'use strict';

var gulp = require('gulp'),
    //Server
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    ngrok = require('ngrok'),
    //Images
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    //Post CSS
    autoprefixer = require('autoprefixer'),
    cssMqpacker = require('css-mqpacker'),
    cssNano = require('cssnano'),
    postcss = require('gulp-postcss'),
    precss = require('precss'),
    clearFix = require('postcss-clearfix'),
    colorShort = require('postcss-color-short'),
    cssNext = require('postcss-cssnext'),
    discardComments = require('postcss-discard-comments'),
    focus = require('postcss-focus'),
    px2Rem = require('postcss-pxtorem'),
    responsiveImages = require('postcss-responsive-images'),
    short = require ('postcss-short'),
    size = require('postcss-size'),
    //HTML (Pug ex Jade)
    pug = require('gulp-pug'),
    //JS
    uglify = require('gulp-uglify'),
    //Other
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    rimraf = require('rimraf'),
    watch = require('gulp-watch');


//=================================================================


var path = {
    build: {
        html: 'public/',
        php: 'public/api',
        js: 'public/js/',
        css: 'public/css/',
        img: 'public/images/',
        fonts: 'public/fonts/'
    },
    src: {
        html: 'src/**/*.html',
        php: 'src/php/**/*.php',
        jsMain: ['src/js/*.js'],
        style: 'src/css/*.pcss',
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        pug: 'src/pug/*.pug',
        html: 'src/**/*.html',
        php: 'src/**/*.php',
        js: 'src/js/**/*.js',
        style: 'src/css/**/*.pcss',
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './public'
};

gulp.task('webserver', function () {
    browserSync({
        server: "./public"
    }, function (err, bs) {
        ngrok.connect(bs.options.get('port'), function (err, url) {
        });
    });
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('pug:build', function() {
    gulp.src('src/pug/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('src/'))
});

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('php:build', function () {
    gulp.src(path.src.php)
        .pipe(gulp.dest(path.build.php));

    gulp.src([
        'src/.htaccess'
    ])
        .pipe(gulp.dest(path.build.html));
});

gulp.task('js:build', function () {
    gulp.src(path.src.jsMain)
        .pipe(sourcemaps.init())
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    var plugins = [
        autoprefixer({browsers: ['> 1%'], cascade: false}),
        cssMqpacker,
        cssNano,
        postcss,
        precss,
        clearFix,
        colorShort,
        cssNext,
        discardComments,
        focus,
        px2Rem,
        responsiveImages,
        short,
        size
    ];
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write())
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('concatPlug:css', function () {
    return gulp.src([
        'bower_components/bootstrap/dist/css/bootstrap.min.css',
        'bower_components/animate.css/animate.min.css',
        'bower_components/hover/css/hover-min.css',
        'bower_components/font-awesome/css/font-awesome.min.css'
    ])
        .pipe(concat('components.min.css'))
        .pipe(gulp.dest(path.build.css));
});

gulp.task('concatPlug:js', function () {
    gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/bootstrap/dist/js/bootstrap.js'
    ])
        .pipe(concat('components.min.js'))
        .pipe(uglify().on('error', function(e){
            console.log(e);
        }))
        .pipe(gulp.dest(path.build.js));
});

gulp.task('build', [
    'pug:build',
    'html:build',
    'php:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'concatPlug:css',
    'concatPlug:js'
]);

gulp.task('watch', function () {
    watch('src/pug/*.pug', function(event, cb) {
        gulp.start('pug:build');
    });
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.php], function (event, cb) {
        gulp.start('php:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);