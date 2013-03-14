var express = require('express')
  , http = require('http')
  , path = require('path')
  , BibleAPI = require('net-bible-api')
  , utils = require('./utils.js')
  , _ = require('underscore')
  , redis = require('redis')
  , client = redis.createClient()
  , everyauth = require('everyauth');

client.on('error', function(err) {
    console.log('redis error ' + err);
});

everyauth.facebook
  .appId('423558631071549')
  .appSecret('df917d5cdd068b9a98b911ce9bb23dc7')
  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {

      var promise = this.Promise();
      promise.fulfill(addOrGetUser(fbUserMetadata));
      return promise;
  })
  .redirectPath('/');

/*
everyauth.everymodule
  .findUserById(function(userId, cb) {
      client.get('users', function(err, reply) {
          console.log('calling the cb ' + reply);
        cb(err, err ? null : JSON.parse(reply));
      });
  });
  */

function addOrGetUser (fbUserMetadata) {
    client.get('users', function(err, reply) {

        if(err || reply == null) {
            var data = { id: 1, data: fbUserMetadata };
            client.set('users', JSON.stringify(data), function(err, reply) {
                return data;   
            });
        }
        else
            return JSON.parse(reply);
    });
}

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
  everyauth.debug = true;
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

        //overwrite whatever had been there
        data[passage] = notes;

        console.log('going to write: ' + JSON.stringify(data));

        //now save in Redis
        client.set(user, JSON.stringify(data), function(err, reply) {
            res.writeHead(200, { "Content-Type" : 'text/plain' });
            res.end(reply);
        });
    });
});

app.post('/saveSermonNotes/', function(req, res) {
    var data = req.body; 
    if(typeof req.body === 'string')
        data = JSON.parse(req.body);

    console.log(data);

    var user = 'user2';

    client.get(user, function(err, reply) {
        var dbData = {};
        if(reply) {
            try {
                dbData = JSON.parse(reply);
            } catch(err) { }
        }

        if(!dbData['sermons'])
            dbData['sermons'] = {};
        else {
            if(data.oldTitle)
                delete dbData['sermons'][data.oldTitle];
        }

        dbData['sermons'][data.title] = data;
        client.set(user, JSON.stringify(dbData), function(err, reply) {
            res.writeHead(200, { "Content-Type" : 'text/plain' });
            res.end(reply);
        });
    });
});

app.get('/get/:text', function(req, res) {
    var match = utils.findScriptureMatch(req.params.text);

    res.writeHead(200, {"Content-Type": "application/json"});

    if(match) {
        var passage = utils.cleanPassageTitle(match.slice(1).join(' '));
        BibleAPI.get(passage)
            .then(function(data) {
                //found Bible passage, now find the notes
                var user = 'user1';

                client.get(user, function(err, reply) {
                    var notes = {};
                    if(reply) {
                        try {
                            notes = JSON.parse(reply);
                            notes = notes[passage];
                        } catch(err) { }
                    }

                    notes = JSON.parse(notes);

                    for(var i = 0, len = notes.length; i < len; ++i) {
                        if(data[notes[i].verse - 1])
                            data[notes[i].verse - 1].note = notes[i].note;
                    }

                    res.end(JSON.stringify({ theText: data, thePassage: passage }));
                });
            }, function(error) {
                res.end("{}");
            }
        );
    }
    else
        res.end("{}");
});

app.get('/takeSermonNotes', function(req, res) {
    console.log(req.user);
    res.render('takeSermonNotesView', { title: 'BibleNote.com', user: req.user });   
});

app.get('/:text/takeNotes', function(req, res) {
    utils.render(req, res, 'takeNotesView');
});

app.get('/:text', function(req, res) {
    utils.render(req, res, 'chapterView');
});

app.get('/', function(req, res) {
    if(req.session && req.session.uid)
        return res.render('index', { title: 'nope' });

    res.render('index', { title: 'BibleNote.com' });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
