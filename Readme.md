Dust compiler
========

Node.js module that is used to compile *.dust templates.

Installation
------------

Add the following dependency into your package.json:

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

* __sourceDir__ - ...
* __compiledDir__ - ...
* __logger__ - ...
* __syncCompilation__ - ...
* __preProcessors__ - ...
* __watchFiles__ - ...
* __subDirSeparator__ - ...
* __compileAll__ - ...
* __compiledAllFilename__ - ...

Tests
-----

Open test directory and launch nodeunit:

    nodeunit compilerTest.js
