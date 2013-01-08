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
                callback(data);
            });
        })
        .on('error', function(error) {
            callback(error);
        });
    }
}

module.exports = BibleApi;
