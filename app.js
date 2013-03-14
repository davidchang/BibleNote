var express = require('express')
  , http = require('http')
  , path = require('path')
  , BibleAPI = require('net-bible-api')
  , utils = require('./utils.js')
  , _ = require('underscore')
  , redis = require('redis')
  , client = redis.createClient()
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

client.on('error', function(err) {
    console.log('redis error ' + err);
});

passport.use(new FacebookStrategy({
    clientID: '423558631071549',
    clientSecret: 'df917d5cdd068b9a98b911ce9bb23dc7',
    callbackURL: '/auth/facebook/callback'
},
    function(accessToken, refreshToken, userData, done) {
        client.get('users', function(err, reply) {

            if(err) {
                done(err); return;
            }

            var allUsers = {};
            try {
                allUsers = JSON.parse(reply);
                if(allUsers[userData.id]) {
                    done(null, allUsers[userData.id]);
                    return;
                }
            } catch (err) { }

            allUsers[userData.id] = userData;
            
            client.set('users', JSON.stringify(allUsers), function(err, reply) {
                if(err) { done(err); return; }

                done(null, userData);   
            });
        });
    })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  client.get('users', function(err, reply) {
    try {
        var allUsers = JSON.parse(reply);
        done(err, allUsers[id]);
    } catch (err) { done("could not deserialize user"); }
  });
});

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
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/Nahum2',
    failureRedirect: '/Nahum3' }));

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

                            for(var i = 0, len = notes.length; i < len; ++i) {
                                if(data[notes[i].verse - 1])
                                    data[notes[i].verse - 1].note = notes[i].note;
                            }
                        } catch(err) { }
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
    if(req.user)
        console.log(req.user);
    res.render('index', { title: 'BibleNote.com', user: req.user });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
