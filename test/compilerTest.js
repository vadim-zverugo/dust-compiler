var dustCompiler = require('../lib/duster'),
    fs = require('fs'),
    path = require('path'),
    cwd = process.cwd();

module.exports = {
    setUp: function(callback) {
        var rmdirRecursive = function (dir) {
            var files = [];
            if (fs.existsSync(dir)) {
                files = fs.readdirSync(dir);
                files.forEach(function (file, index) {
                    var filePath = path.join(dir, file);
                    if (fs.statSync(filePath).isDirectory()) {
                        rmdirRecursive(filePath);
                    } else {
                        fs.unlinkSync(filePath);
                    }
                });
                fs.rmdirSync(dir);
            }
        };
        var compiledDir = path.join(cwd, 'compiled');
        rmdirRecursive(compiledDir);

        callback();
    },

    testCompiler: function (test) {
        dustCompiler.init({
            sourceDir: '/views',
            compiledDir: '/compiled',
            syncCompilation: true,
            watchFiles: false
        });

        var rootContent = fs.readFileSync(path.join(cwd, 'compiled', 'root.js'));
        test.equal(rootContent, "(function(){dust.register(\"root\",body_0);function body_0(chk,ctx)" +
            "{return chk.write(\"<div><div><p>Test template for the dust compiler!</p><p>Hello \")" +
            ".reference(ctx._get(false, [\"username\"]),ctx,\"h\").write(\"</p></div><div>\")" +
            ".partial(\"./child/child.dust\",ctx,null).write(\"</div></div>\");}return body_0;})();");

        var childContent = fs.readFileSync(path.join(cwd, 'compiled', 'child', 'child.js'));
        test.equals(childContent, "(function(){dust.register(\"child__child\",body_0);function body_0(chk,ctx)" +
            "{return chk.write(\"<div><p>Duster</p></div>\");}return body_0;})();");

        test.done();
    },

    testCompilerPreProcessors: function (test) {
        dustCompiler.init({
            sourceDir: '/views',
            compiledDir: '/compiled',
            syncCompilation: true,
            watchFiles: false,
            preProcessors: [
                function(content) {
                    if (content.indexOf('{username}') !== -1) {
                        content = content.replace('{username}', 'User');
                    }
                    return content;
                }
            ]
        });

        var rootContent = fs.readFileSync(path.join(cwd, 'compiled', 'root.js'));
        test.equal(rootContent, "(function(){dust.register(\"root\",body_0);function body_0(chk,ctx)" +
            "{return chk.write(\"<div><div><p>Test template for the dust compiler!</p><p>Hello User</p></div><div>\")" +
            ".partial(\"./child/child.dust\",ctx,null).write(\"</div></div>\");}return body_0;})();");

        test.done();
    },

    testCompilerSubDirSeparator: function(test) {
        dustCompiler.init({
            sourceDir: '/views',
            compiledDir: '/compiled',
            syncCompilation: true,
            watchFiles: false,
            subDirSeparator: '---'
        });

        var childContent = fs.readFileSync(path.join(cwd, 'compiled', 'child', 'child.js'));
        test.equals(childContent, "(function(){dust.register(\"child---child\",body_0);function body_0(chk,ctx)" +
            "{return chk.write(\"<div><p>Duster</p></div>\");}return body_0;})();");

        test.done();
    },

    testCompilerAllCompilation: function(test) {
        dustCompiler.init({
            sourceDir: '/views',
            compiledDir: '/compiled',
            syncCompilation: true,
            watchFiles: false,
            compileAll: true,
            compiledAllFilename: 'common'
        });

        var commonContent = fs.readFileSync(path.join(cwd, 'compiled', 'common.js'));
        test.equals(commonContent, "(function(){dust.register(\"child__child\",body_0);function body_0(chk,ctx)" +
            "{return chk.write(\"<div><p>Duster</p></div>\");}return body_0;})();\n" +
            "(function(){dust.register(\"root\",body_0);function body_0(chk,ctx)" +
            "{return chk.write(\"<div><div><p>Test template for the dust compiler!</p><p>Hello \")" +
            ".reference(ctx._get(false, [\"username\"]),ctx,\"h\").write(\"</p></div><div>\")" +
            ".partial(\"./child/child.dust\",ctx,null).write(\"</div></div>\");}return body_0;})();\n");

        test.done();
    }
};