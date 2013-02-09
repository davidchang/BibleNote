'use strict';

App.service('Bible', ['$http', function($http) {
    this.getText = function(text, notes, callback) {
        text = text.replace(/ /g,'');
        $http.get('/get/' + text + '?notes=' + notes)
            .then(function(res) {
                callback(res);
            });
    }
}
]);
