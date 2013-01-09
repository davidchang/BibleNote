var http = require('http'),
    qs = require('querystring');

var BibleApi =  {
    baseUrl: 'http://labs.bible.org/api/?type=json&passage=',

    get: function(passage, success, failure) {
        var data = '';
        http.get(this.baseUrl + passage, function(res) {
            res.setEncoding = 'utf8';
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                success(data);
            });
        })
        .on('error', function(error) {
            console.log("error from calling BibleApi with " + passage);
            console.log(error);
            if(failure)
                failure(error);
        });
    }
}

module.exports = BibleApi;
