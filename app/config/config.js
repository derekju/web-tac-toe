var _ = require('underscore'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    compression = require('compression');

module.exports = function (app, express) {
    var paths = {
            CONFIG_PATH: __dirname + '/../config',
            LIBS_PATH: __dirname + '/../libs',
            PUBLIC_PATH: __dirname + '/../public',
            ROUTES_PATH: __dirname + '/../routes',
            VIEWS_PATH: __dirname + '/../views'
        },
        constants = require(paths.CONFIG_PATH + '/constants.json'),
        strings = require(paths.CONFIG_PATH + '/strings.json');

    // Compression
    app.use(compression());

    // Logging
    app.use(morgan());

    // Middleware
    app.set('views', paths.VIEWS_PATH);
    app.set('view engine', 'jade');
    app.use(express.static(paths.PUBLIC_PATH), { maxAge: 86400000 });
    app.use(bodyParser());

    return _.extend(paths, constants, strings);
};
