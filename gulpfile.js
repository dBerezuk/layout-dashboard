import browserSync from 'browser-sync';
import { dest, parallel, series, src, watch } from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import changed from 'gulp-changed';
import clean from 'gulp-clean';
import concat from 'gulp-concat';
import fileinclude from 'gulp-file-include';
import imagemin from 'gulp-imagemin';
import rename from 'gulp-rename';
import gulpScss from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify-es';
import webp from 'gulp-webp';
import * as sass from 'sass';

const scss = gulpScss(sass);
const ug = uglify.default;
const bs = browserSync.create();

export function pages() {
	return src('./app/pages/*.html')
		.pipe(
			fileinclude({
				prefix: '@@',
				basepath: './app/components'
			})
		)
		.pipe(dest('./app'))
		.pipe(bs.stream());
}

export function images() {
	const options = { encoding: false };

	return src('./app/images/src/**/*', options)
		.pipe(changed('./app/images'))
		.pipe(webp())
		.pipe(src('./app/images/src/**/*', options))
		.pipe(changed('./app/images'))
		.pipe(imagemin({ verbose: true }))
		.pipe(dest('./app/images'));
}

export function fonts(done) {
	done();
	// return src('./app/fonts/src/**/*.ttf')
	// 	.pipe(changed('./app/fonts'))
	// 	.pipe(ttf2woff2())
	// 	.pipe(dest('./app/fonts'));
}

export function styles() {
	return src('./app/scss/styles.scss')
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 5 version']
			})
		)
		.pipe(sourcemaps.init()) //при build убрать
		.pipe(concat('styles.min.css'))
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(sourcemaps.write()) //при build убрать
		.pipe(dest('./app/css'))
		.pipe(bs.stream());
}

export function scripts() {
	return src(['./app/js/src/**/*.js'])
		.pipe(rename({ suffix: '.min' }))
		.pipe(
			babel({
				presets: [
					[
						'@babel/preset-env',
						{
							targets: {
								browsers: ['> 0.25%, not dead', 'ie 11']
							}
						}
					]
				]
			})
		)
		.pipe(ug())
		.pipe(dest('app/js'))
		.pipe(bs.stream());
}

// export function scriptsLibs() {
// 	return src([])
// 		.pipe(ug())
// 		.pipe(concat('libs.min.js'))
// 		.pipe(dest('app/js'));
// }

export function cleanDist() {
	return src('docs', { allowEmpty: true, read: false })
		.pipe(clean());
}

export function building() {
	return src(
		[
			'./app/*.html',
			'./app/images/**/*',
			'!./app/images/src/**',
			'./app/fonts/**/*.woff2',
			'./app/css/styles.min.css',
			'./app/js/**/*.min.js'
		],
		{ base: 'app', encoding: false }
	).pipe(dest('docs'));
}

export function watching() {
	bs.init({
		server: {
			baseDir: './app',
			serveStaticOptions: {
				extensions: ['html']
			},
			port: 3000
		}
	});

	watch(['app/pages', 'app/components'], pages);
	watch(['app/images'], images);
	watch(['app/fonts/src'], fonts);
	watch(['app/scss/**/*.scss'], styles);
	watch(['app/js/**/*.js', '!app/js/**/*.min.js'], scripts);
}

export const build = series(cleanDist, building);
export default parallel(images, fonts, styles, scripts, pages, watching);
