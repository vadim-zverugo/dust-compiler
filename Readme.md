Dust compiler
========

Node.js module that is used to compile *.dust templates.

Installation
------------

Add the following dependency into your `package.json`:

    "dust-compiler": "git+https://github.com/vadim-zverugo/dust-compiler.git"

And load this dependency:

    npm install

Usage
-----

    require('dust-compiler').init({
        sourceDir: '/views',
        compiledDir: '/public/dust'
    });

Options
-----

* `sourceDir` (required):
* `compiledDir` (required):
* `logger` (optional, defaults to `console`):
* `syncCompilation` (optional, defaults to `false`):
* `clearCompiled` (optional, defaults to `true`):
* `preProcessors` (optional, defaults to `[]`):
* `postProcessors` (optional, defaults to `[]`):
* `watchFiles` (optional, defaults to `true`):
* `subDirSeparator` (optional, defaults to `__`):
* `compileAll` (optional, defaults to `false`):
* `compiledAllFilename` (optional, defaults to `all`):

Tests
-----

Open `test` directory and launch `nodeunit`:

    nodeunit compilerTest.js
