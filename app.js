
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

String.prototype.capitalize = function(){
    return this.replace(/(^[a-z]|[ .,\(\)\[\]]+[a-z])/g, function(s) {
        return s.toUpperCase();
    });
};

function trim(word) {
    return word.replace(/^\s+|\s+$/g, '').capitalize();
}

function getBookName(match) {
    var name = match.slice(1, match.length - 1).join(' ');
    name = trim(name).toLowerCase();
    return name;
}

app.post('/saveNotes/', function(req, res) {
    var data = JSON.parse(req.body);
    var notes = data.notes;
    var passage = data.passage;

    //now save in Redis

    res.writeHead(200, { "Content-Type" : 'text/plain' });
    res.end('thanks!');
});

app.get('/:text/takeNotes', function(req, res) {
    var text = req.params.text;
    var passageRegex = /^([0-9]*)([a-zA-Z]+)([0-9]+)$/;
    var match = passageRegex.exec(text);

    var onFailure = function() {
        res.redirect('/');
    };

    if(match) {
        var passage = trim(match.slice(1).join(' '));
        BibleAPI.get(passage, function(data) {
            var jsonData = JSON.parse(data)[0];
            if(data && data.length && jsonData.bookname.toLowerCase() == getBookName(match) && jsonData.chapter == match[match.length - 1])
                res.render('takeNotesView', { title: passage, theText: data, thePassage: passage });
            else
                onFailure();
        }, function(error) {
            onFailure();
        });
    }
    else
        onFailure();
});

app.get('/:text', function(req, res) {
    var text = req.params.text;
    var passageRegex = /^([0-9]*)([a-zA-Z]+)([0-9]+)$/;
    var match = passageRegex.exec(text);

    var onFailure = function() {
        res.redirect('/');
    };

    if(match) {
        var passage = trim(match.slice(1).join(' '));
        BibleAPI.get(passage, function(data) {
            var jsonData = JSON.parse(data)[0];
            if(data && data.length && jsonData.bookname.toLowerCase() == getBookName(match) && jsonData.chapter == match[match.length - 1])
                res.render('chapterView', { title: passage, theText: data, thePassage: passage });
            else
                onFailure();
        }, function(error) {
            onFailure();
        });
    }
    else
        onFailure();
});

app.get('/', function(req, res) {
    res.render('index', { title: 'BibleNote.com' });   
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
