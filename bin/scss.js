"use strict";

const sass = require('node-sass')
const CleanCSS = require('clean-css');
const autoprefixer = require('autoprefixer');
const postcss      = require('postcss');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const files = glob.sync(path.join(__dirname, '/../scss/*.scss'));
const outpath = path.join(__dirname, '/../css/');

files.forEach((f) => {
  const filename = f;
  const isInclude = path.basename(filename).indexOf('_');
  if(isInclude >= 0){
    // ignores include files beginning with '_'
    return;
  }
  sass.render({
    file: filename
  }, function(err, result) {
    if (err) {
      console.warn(err);
      process.exit(1);
    }
    const clean = new CleanCSS();
    const basename = path.basename(filename, '.scss');
    // const css = clean.minify(result.css).styles;
    const css = result.css;
    const outFile = path.join(outpath, `${basename}.css`);



    fs.writeFileSync(outFile, css.toString());

    let newCSS = fs.readFileSync(outFile);

    postcss([ autoprefixer ]).process(newCSS).then(function (result) {
        result.warnings().forEach(function (warn) {
            console.warn(warn.toString());
        });
        fs.writeFileSync(outFile, result.toString());
        // console.log(result.css);
    });

  });




});
