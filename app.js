var express = require('express')
  , http = require('http')
  , path = require('path')
  , BibleAPI = require('./BibleAPI.js')
  , utils = require('./utils.js')
  , redis = require('redis')
  , client = redis.createClient()
  , passport = require('passport');

client.on('error', function(err) {
    console.log('redis error ' + err);
});

/* singly */
var SinglyStrategy = require('passport-singly').Strategy;

var SINGLY_APP_ID = process.env.SINGLY_APP_ID || "f405c5fdcb0b59c4515883ad700b1836";
var SINGLY_APP_SECRET = process.env.SINGLY_APP_SECRET || "a2713e559a9f70827066711ebaff0960";

var CALLBACK_URL = process.env.CALLBACK_URL || "http://localhost:3000/auth/singly/callback";

passport.serializeUser(function (user, done) {
      done(null, user);
});

passport.deserializeUser(function (obj, done) {
      done(null, obj);
});

function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated())
          return next();

      res.redirect('/login');
}

passport.use(new SinglyStrategy({
    clientID: SINGLY_APP_ID,
    clientSecret: SINGLY_APP_SECRET,
    callbackURL: CALLBACK_URL
  },
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));
/* singly */

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
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/login', function(req, res) {
    res.render('login', {user: req.user, title: 'BibleNote | Login'});
});

app.get('/auth/singly/callback', passport.authenticate('singly', {
    failureRedirect: '/login',
    successReturnToOrRedirect: '/'
}));

app.get('/auth/singly/:service', passport.authenticate('singly'));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
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

function renderPassageAndNotes(req, res, viewToShow) {
    var text = req.params.text;
    var passageRegex = /^([0-9]*)([a-zA-Z]+)([0-9]+)$/;
    var match = passageRegex.exec(text);

    var onFailure = function() {
        res.redirect('/');
    };

    if(match) {
        var passage = utils.clean(match.slice(1).join(' '));
        BibleAPI.get(passage, function(error, data) {
            if(error)
                onFailure();

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
                    res.render(viewToShow, { title: passage, theText: data, thePassage: passage, theNotes: notes });
                });
            }
        });
    }

    onFailure();
}

app.get('/:text/takeNotes', function(req, res) {
    renderPassageAndNotes(req, res, 'takeNotesView');
});

app.get('/get/:text', function(req, res) {
    var text = req.params.text;
    var passageRegex = /^([0-9]*)([a-zA-Z]+)([0-9]+)$/;
    var match = passageRegex.exec(text);

    res.writeHead(200, {"Content-Type": "application/json"});

    if(match) {
        var passage = utils.clean(match.slice(1).join(' '));
        BibleAPI.get(passage, function(error, data) {
            if(error)
                res.end("{}");

            var jsonData = JSON.parse(data)[0];
            if(data && data.length && jsonData.bookname.toLowerCase() == utils.getBookName(match) && jsonData.chapter == match[match.length - 1])
                res.end(JSON.stringify({ theText: data, thePassage: passage }));
            else
                res.end("{}");
        });
    }
    else
        res.end("{}");
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
        res.render('chapterView', { title: passage });
    }
    else
        onFailure();
});

app.get('/', function(req, res) {
    console.log(req.user);
    res.render('index', { title: 'BibleNote.com', user: req.user });   
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
