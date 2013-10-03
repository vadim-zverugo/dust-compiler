var fs = require('fs'),
    path = require('path'),
    dust = require('dustjs-linkedin'),
    watch = require('watch'),
    cwd = process.cwd();

exports.init = function(logger, preProcessors) {
    if (typeof logger === 'undefined' || !logger) {
        logger = console;
    }
    if (typeof preProcessors === 'undefined' || !preProcessors) {
        preProcessors = [];
    }
    var configFile = path.normalize(cwd + '/duster.json');
    fs.readFile(configFile, 'utf8', function(err, data) {
        if (err) {
            logger.error('Error reading ' + configFile + ' because ' + err);
        } else {
            duster(JSON.parse(data), logger, preProcessors);
        }
    });
};

function duster(config, logger, preProcessors) {
    var inputDir = path.normalize(cwd + config.raw_dir),
        outputDir = path.normalize(cwd + config.pre_dir);

    // Create output dir if need.
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Start compiling input dirs.
    compileDir(inputDir);

    function compileDir(dir) {
        fs.readdirSync(dir).forEach(function(dirItem) {
            var dirItemPath = path.normalize(dir + path.sep + dirItem);
            if (fs.statSync(dirItemPath).isDirectory()) {
                compileDir(dirItemPath);
            } else if (dirItem.indexOf('.dust') !== -1) {
                compileDust(dirItemPath);
            }
        });
    }

    function compileDust(file) {
        fs.readFile(file, function(err, data) {
            if (err) {
                logger.error('Error reading ' + file + ' because ' + err);
            } else {
                var content = String(data);
                var templateRelFile = file.substring(inputDir.length);
                var outputFile = outputDir + templateRelFile.replace('.dust', '.js');

                // Template identifier for keeping in dust cache.
                var templateId = templateRelFile.replace('.dust', '');
                if (templateId.indexOf(path.sep) === 0) {
                    templateId = templateId.substring(path.sep.length);
                }
                while (templateId.indexOf(path.sep) !== -1) {
                    templateId = templateId.replace(path.sep, '__');
                }

                // Pre-processing template content.
                for (var i = 0; i < preProcessors.length; i++) {
                    var preProcessor = preProcessors[i];
                    if (typeof preProcessor === 'function') {
                        content = preProcessor(content);
                    }
                }

                // Compile template.
                var compiled = dust.compile(content, templateId);

                // Create output directory if need.
                var outputFileDir = path.dirname(outputFile);
                if (!fs.existsSync(outputFileDir)) {
                    fs.mkdirSync(outputFileDir);
                }

                // Save compiled file.
                fs.writeFile(outputFile, compiled, function(err) {
                    if (err) {
                        logger.error('Error saving ' + outputFile + ' because ' + err);
                    } else {
                        logger.info('Compiled template ' + outputFile + ' saved with id ' + templateId);
                    }
                });
            }
        });
    }

    watch.createMonitor(inputDir, function(monitor) {
        logger.info("Monitoring file changes in " + inputDir);
        monitor.files['*.dust', '*/*'];
        monitor.on("created", compileDust);
        monitor.on("changed", compileDust);
    });
}