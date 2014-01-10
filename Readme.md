Dust compiler
========

Node.js module for compiling *.dust templates.  

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

* `sourceDir` (required): directory with *.dust templates for compilation.
* `compiledDir` (required): destination directory where compiled js files will be saved. 
* `logger` (optional, defaults to `console`): custom logger (should provide .error() and .info() methods).
* `syncCompilation` (optional, defaults to `false`): compile all dust templates synchronously. By default another processes don't wait while compiler will finish compilation. 
* `clearCompiled` (optional, defaults to `true`): remove all compiled js files before launching new compilation. 
* `preProcessors` (optional, defaults to `[]`): functions to process template content before compilation. Each function accepts two arguments `templateContent` and `templateFilename` and have to return processed content.   
* `postProcessors` (optional, defaults to `[]`): funtions to process compiled js content. Each function accepts two arguments `compiledContent` and `compiledFilename` and have to return processed content.  
* `watchFiles` (optional, defaults to `true`): allows to re-compile *.dust templates when source file changes.
* `subDirSeparator` (optional, defaults to `__`): is used to identify compiled js template as a separator of sub-directories. 
* `compileAll` (optional, defaults to `false`): allows to collect all compiled js templates in one file `compiledAllFilename`.js.
* `compiledAllFilename` (optional, defaults to `all`): name of the file with all compiled js templates. 

Tests
-----

Open `test` directory and launch `nodeunit`:

    nodeunit compilerTest.js
