var http = require('http'),
    qs = require('querystring');

var BibleApi =  {
    baseUrl: 'http://labs.bible.org/api/?type=json&passage=',

    get: function(passage, callback) {
        var data = '';
        http.get(this.baseUrl + passage, function(res) {
            res.setEncoding = 'utf8';
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                callback(null, data);
            });
        })
        .on('error', function(error) {
            console.log("error from calling BibleApi with " + passage);
            console.log(error);

            callback(error);
        });
    }
}

module.exports = BibleApi;
