const gulp = require('gulp'),
      plugins = require('gulp-load-plugins')();

var config = {
    srcDir: 'src/',
    distDir: 'dist/',
    cssDir: 'css',
    fontDir: 'font',
    htmlDir: 'templates',
    jsDir: 'js',
    jsVendor: 'vendor',
    vendorLibraries: {
        jquery: 'node_modules/jquery/dist/jquery.min.js',
        popper: 'node_modules/popper.js/dist/umd/popper.min.js',
        bootstrap: 'node_modules/bootstrap/dist/js/bootstrap.min.js'
    },

    fontsLibraries: {
        fontAwesome: 'node_modules/@fortawesome/fontawesome-free/webfonts/**',
        
    },

    jsFiles: 'js/**/*.js',
    sassFiles: 'scss/**/*.scss',
    pugFiles: 'views/layout/**/*.pug',
    htmlFiles: 'views/**/*.pug',
}

const templatesFiles = "src/views/layout/*.pug";

function libraries(vendorLibraries) {  
    arrayItems = [];
    itemArrays = [];
    for (var item in vendorLibraries) {
        if (vendorLibraries.hasOwnProperty(item)) {
            arrayItems.push(vendorLibraries[item]);   
            itemArrays = item;    
              
        }
    }
}

gulp.task('fonts', function(){
    libs = [];
    for (let lib in config.fontsLibraries) {    
        if (config.fontsLibraries.hasOwnProperty(lib)) {
            libs.push(gulp.src(config.fontsLibraries[lib]).pipe(gulp.dest(config.distDir+config.fontDir+'/'+lib)));
        }
    }

    return libs;
      
})

gulp.task('pug', function(){
    gulp.src(config.srcDir+config.pugFiles)
        .pipe(plugins.plumber())
        .pipe(plugins.pug({pretty:true}))
        .pipe(gulp.dest(config.distDir+config.htmlDir));
});

gulp.task('sass', function () {
    gulp.src(config.srcDir+config.sassFiles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.plumber())
        .pipe(plugins.sass({outputStyle: 'compressed'}))
        .pipe(plugins.rename('style.min.css'))
        .pipe(plugins.sourcemaps.write())        
        .pipe(gulp.dest(config.distDir+config.cssDir));  
});

gulp.task('concatScripts', function() {
    libraries(config.vendorLibraries)
       
    gulp.src(arrayItems.concat(config.srcDir+config.jsFiles))
    .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.concat('main.min.js'))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(config.distDir+config.jsDir));
});

gulp.task('watch', function () {
    plugins.livereload.listen();
    gulp.watch(config.srcDir+config.sassFiles, ['sass']);
    gulp.watch(config.srcDir+config.jsFiles, ['concatScripts']);
    gulp.watch(config.srcDir+config.htmlFiles, ['pug']);
});

gulp.task('default', ['sass', 'fonts', 'concatScripts', 'pug', 'watch']);