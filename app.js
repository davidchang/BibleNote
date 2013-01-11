var express = require('express')
  , http = require('http')
  , path = require('path')
  , BibleAPI = require('./BibleAPI.js')
  , utils = require('./utils.js')
  , redis = require('redis')
  , client = redis.createClient();

client.on('error', function(err) {
    console.log('redis error ' + err);
});

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

app.post('/saveNotes/', function(req, res) {

    var data = req.body; 
    if(typeof req.body === 'string')
        data = JSON.parse(req.body);

    var notes = data.notes;
    var passage = data.passage;

    var user = 'user1';

    client.get(user, function(err, reply) {
        var data = {};
        if(reply) {
            try {
                data = JSON.parse(reply);
            } catch(err) { }
        }

        data[passage] = notes;

        console.log('going to write: ' + JSON.stringify(data));

        //now save in Redis
        client.set(user, JSON.stringify(data), function(err, reply) {
            res.writeHead(200, { "Content-Type" : 'text/plain' });
            res.end(reply);
        });
    });

});

app.get('/:text/takeNotes', function(req, res) {
    var text = req.params.text;
    var passageRegex = /^([0-9]*)([a-zA-Z]+)([0-9]+)$/;
    var match = passageRegex.exec(text);

    var onFailure = function() {
        res.redirect('/');
    };

    if(match) {
        var passage = utils.clean(match.slice(1).join(' '));
        BibleAPI.get(passage, function(data) {
            var jsonData = JSON.parse(data)[0];
            if(data && data.length && jsonData.bookname.toLowerCase() == utils.getBookName(match) && jsonData.chapter == match[match.length - 1]) {
                //found the chapter

                var user = 'user1';

                client.get(user, function(err, reply) {
                    var notes = {};
                    if(reply) {
                        try {
                            notes = JSON.parse(reply);
                            notes = notes[passage];
                        } catch(err) { }
                    }
                    res.render('takeNotesView', { title: passage, theText: data, thePassage: passage, theNotes: notes });
                });
            }
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
        var passage = utils.clean(match.slice(1).join(' '));
        BibleAPI.get(passage, function(data) {
            var jsonData = JSON.parse(data)[0];
            if(data && data.length && jsonData.bookname.toLowerCase() == utils.getBookName(match) && jsonData.chapter == match[match.length - 1])
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
