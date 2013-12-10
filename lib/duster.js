var fs = require('fs'),
    path = require('path'),
    dust = require('dustjs-linkedin'),
    watch = require('watch'),
    cwd = process.cwd();

var extendOptions = function(defaultOptions, customOptions) {
    for (var customProp in customOptions) {
        if (customOptions.hasOwnProperty(customProp)) {
            defaultOptions[customProp] = customOptions[customProp];
        }
    }
};

var compiler = function(options) {
    var sourceDir = path.normalize(cwd + options.sourceDir),
        compiledDir = path.normalize(cwd + options.compiledDir),
        logger = options.logger,
        syncCompilation = options.syncCompilation,
        preProcessors = options.preProcessors,
        postProcessors = options.postProcessors,
        watchFiles = options.watchFiles,
        subDirSeparator = options.subDirSeparator,
        compileAll = options.compileAll,
        compileAllOutputFile = path.join(compiledDir, (options.compiledAllFilename + '.js'));

    var compileDustContent = function(filename, data) {
        var content = String(data);
        var templateRelFile = filename.substring(sourceDir.length);
        var outputFile = compiledDir + templateRelFile.replace('.dust', '.js');

        // Build template identifier for storing in dust cache.
        var templateId = templateRelFile.replace('.dust', '');
        if (templateId.indexOf(path.sep) === 0) templateId = templateId.substring(path.sep.length);
        while (templateId.indexOf(path.sep) !== -1) {
            templateId = templateId.replace(path.sep, subDirSeparator);
        }

        // Execute content pre-processors.
        for (var i = 0; i < preProcessors.length; i++) {
            var preProcessor = preProcessors[i];
            if (typeof preProcessor === 'function') content = preProcessor(content);
        }

        // Compile content of template.
        var compiled = dust.compile(content, templateId);

        // Execute compiled content post-processors.
        for (var j = 0; j < postProcessors.length; j++) {
            var postProcessor = postProcessors[j];
            if (typeof postProcessor === 'function') compiled = postProcessor(compiled);
        }

        // Create directory for compiled template.
        var outputFileDir = path.dirname(outputFile);
        if (!fs.existsSync(outputFileDir)) fs.mkdirSync(outputFileDir);

        // Save compiled file.
        var savedSuccessfully = true;
        if (!syncCompilation) {
            fs.writeFile(outputFile, compiled, function (err) {
                if (err) {
                    savedSuccessfully = false;
                    logger.error('Error saving ' + outputFile + ' because ' + err);
                } else {
                    if (compileAll) fs.appendFile(compileAllOutputFile, (compiled + '\n'));
                }
            });
        } else {
            fs.writeFileSync(outputFile, compiled);
            if (compileAll) fs.appendFileSync(compileAllOutputFile, (compiled + '\n'));
        }
        if (savedSuccessfully) logger.info('Compiled template ' + outputFile + ' saved with id ' + templateId);
    };

    var compileDust = function(file) {
        if (!syncCompilation) {
            fs.readFile(file, function(err, data) {
                if (err) {
                    logger.error('Error reading ' + file + ' because ' + err);
                    return;
                }
                compileDustContent(file, data);
            });
        } else {
            var data = fs.readFileSync(file);
            if (data) compileDustContent(file, data);
        }
    };

    var compileDir = function(dir) {
        fs.readdirSync(dir).forEach(function(dirItem) {
            var dirItemPath = path.join(dir, dirItem);
            if (fs.statSync(dirItemPath).isDirectory()) {
                compileDir(dirItemPath);
            } else if (dirItem.indexOf('.dust') !== -1) {
                compileDust(dirItemPath);
            }
        });
    };

    // Create dir for compiled templates.
    if (!fs.existsSync(compiledDir)) fs.mkdirSync(compiledDir);

    compileDir(sourceDir);

    if (watchFiles) {
        watch.createMonitor(sourceDir, function(monitor) {
            logger.info("Monitoring file changes in " + sourceDir);
            monitor.files['*.dust', '*/*'];
            monitor.on("created", compileDust);
            monitor.on("changed", compileDust);
        });
    }
};

module.exports.init = function(customOptions) {
    var options = {
        sourceDir: null,
        compiledDir: null,
        logger: console,
        syncCompilation: false,
        preProcessors: [],
        postProcessors: [],
        watchFiles: true,
        subDirSeparator: '__',
        compileAll: false,
        compiledAllFilename: 'all'
    };
    extendOptions(options, customOptions);

    if (!options.sourceDir) {
        options.logger.error('Cannot continue because sourceDir property is not specified.');
        return;
    }
    if (!options.compiledDir) {
        options.logger.error('Cannot continue because compiledDir property is not specified.');
        return;
    }

    compiler(options);
};