'use strict';

App.service('Bible', ['$http', function($http) {
    this.getText = function(text, callback) {
        text = text.replace(/ /g,'');
        $http.get('/get/' + text)
            .then(function(res) {
                callback(res);
            });
    }
}
]);
