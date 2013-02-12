'use strict';

App.service('Bible', ['$http', function($http) {
    this.getText = function(text, notes, callback) {
        text = text.replace(/ /g,'');
        $http.get('/get/' + text + '?notes=' + notes)
            .then(function(res) {
                callback(res);
            });
    }

    this.saveNotes = function(notes, chapter, callback) {
        $http.post('/saveNotes/', { notes: JSON.stringify(notes), passage: chapter})
            .then(function(res){
                callback(res.data !== 'OK', res);
            });
    };

    this.saveSermonNotes = function(notesObject, callback) {
        $http.post('/saveSermonNotes/', { notes: JSON.stringify(notesObject) })
            .then(function(res) {
                callback(res.data !== 'OK', res);
            });
    }
}
]);
