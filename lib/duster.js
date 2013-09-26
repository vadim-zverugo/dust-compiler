var fs = require('fs'),
    path = require('path'),
    dust = require('dustjs-linkedin'),
    watch = require('watch'),
    cwd = process.cwd(),
    configPath = path.normalize(cwd + '/duster.json');

exports.init = function() {
    fs.readFile(configPath, 'utf8', function(err, data) {
        if (err) {
            console.error('Error: ' + err);
        } else {
            duster(JSON.parse(data));
        }
    });
};

function duster(config) {
    var inputDir = path.normalize(cwd + config.raw_dir),
        outputDir = path.normalize(cwd + config.pre_dir);

    // Create base output dir if need.
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
                throw err;
            }

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

            // Compile template.
            var compiled = dust.compile(String(data), templateId);

            // Create output directory if need.
            var outputFileDir = path.dirname(outputFile);
            if (!fs.existsSync(outputFileDir)) {
                fs.mkdirSync(outputFileDir);
            }

            // Save compiled file.
            fs.writeFile(outputFile, compiled, function(err) {
                if (err) {
                    throw err;
                }
                console.debug('Dust template compiled and saved to ' + outputFile + ' with id: ' + templateId);
            });
        });
    }

    watch.createMonitor(inputDir, function(monitor) {
        console.info("Watching " + inputDir);
        monitor.files['*.dust', '*/*'];
        monitor.on("created", compileDust);
        monitor.on("changed", compileDust);
    });
}