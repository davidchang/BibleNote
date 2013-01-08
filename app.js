
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var BibleAPI = require('./BibleAPI.js');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/get/:text', function(req, res) {
    BibleAPI.get('Nahum 1', function(data) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(data);
    });
});

app.get('/:text', function(req, res) {
    var text = req.params.text;
    var passageRegex = /^([0-9]*)([a-zA-Z]+)([0-9]+)$/;
    var match = passageRegex.exec(text);
    if(match) {
        var passage = match.slice(1).join(' ');
        BibleAPI.get(passage, function(data) {
            res.render('index', { title: passage, theText: data, thePassage: passage });
        });
    }
    else {
        res.render('index', { title: passage });   
    }
});

app.get('/', function(req, res) {
    res.render('index', { title: 'Express' });   
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
