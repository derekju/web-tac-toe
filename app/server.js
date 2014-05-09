(function() {
    var express = require('express'),
        app = express(),
        config = require(__dirname + '/config/config')(app, express);
    require(__dirname + '/routes')(app, config);
    app.listen(process.env.PORT || config.APP_PORT);
})();