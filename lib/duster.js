var fs = require('fs'),
    path = require('path'),
    dust = require('dustjs-linkedin'),
    watch = require('watch'),
    cwd = process.cwd();

module.exports.init = function(options, logger, preProcessors) {
    if (!hasProp(options, 'logger')) options.logger = console;
    if (!hasProp(options, 'sourceDir')) {
        options.logger.error('Cannot continue because sourceDir property is not specified.');
        return;
    }
    if (!hasProp(options, 'compiledDir')) {
        options.logger.error('Cannot continue because compiledDir property is not specified.');
        return;
    }
    if (!hasProp(options, 'preProcessors')) options.preProcessors = [];
    if (!hasProp(options, 'watchFiles')) options.watchFiles = true;
    if (!hasProp(options, 'subDirSeparator')) options.dirSeparator = '__';
    if (!hasProp(options, 'compileAll')) options.compileAll = false;
    if (!hasProp(options, 'compileAllFilename')) options.compileAllFilename = 'all';

    compiler(options);
};

var hasProp = function(obj, prop) {
    return obj.hasOwnProperty(prop);
};

var compiler = function(options) {
    var sourceDir = path.normalize(cwd + options.sourceDir),
        compiledDir = path.normalize(cwd + options.compiledDir),
        logger = options.logger,
        preProcessors = options.preProcessors,
        watchFiles = options.watchFiles,
        subDirSeparator = options.subDirSeparator,
        compileAll = options.compileAll,
        compileAllFilename = options.compileAllFilename,
        compiledAll = '';

    var compileDust = function(file) {
        fs.readFile(file, function(err, data) {
            if (err) {
                logger.error('Error reading ' + file + ' because ' + err);
                return;
            }

            var content = String(data);
            var templateRelFile = file.substring(sourceDir.length);
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

            // Create directory for compiled template.
            var outputFileDir = path.dirname(outputFile);
            if (!fs.existsSync(outputFileDir)) fs.mkdirSync(outputFileDir);

            // Save compiled file.
            fs.writeFile(outputFile, compiled, function (err) {
                if (err) {
                    logger.error('Error saving ' + outputFile + ' because ' + err);
                } else {
                    logger.info('Compiled template ' + outputFile + ' saved with id ' + templateId);
                }
            });

            if (compileAll) compiledAll += (compiled + '\n');
        });
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

    if (compileAll && compiledAll !== '') {
        var compiledAllOutputFile = path.join(compiledDir, (compileAllFilename + '.js'));
        fs.writeFile(compiledAllOutputFile, compiledAll, function(err) {
            if (err) logger.error('Error saving ' + compiledAllOutputFile + ' because ' + err);
        });
    }

    if (watchFiles) {
        watch.createMonitor(sourceDir, function(monitor) {
            logger.info("Monitoring file changes in " + sourceDir);
            monitor.files['*.dust', '*/*'];
            monitor.on("created", compileDust);
            monitor.on("changed", compileDust);
        });
    }
};