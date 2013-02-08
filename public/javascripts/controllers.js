'use strict';

App.controller('BibleNoteCtrl', ['$scope', '$http', 'Bible', function($scope, $http, Bible) {
    //Data

    Bible.getText(thePassage, function(json) {
        $scope.verses = JSON.parse(json.data.theText);
    });

/*
    if(theText) {
        $scope.verses = JSON.parse(theText);
        if(theNotes) {
            var notesJSON = JSON.parse(theNotes);
            for(var i = 0; i < notesJSON.length; ++i) {
                var matchingVerse = _.find($scope.verses, function(x) {
                    return x.verse == notesJSON[i].verse;
                });
                matchingVerse.note = notesJSON[i].note;
            }
        }
    }
    else
        $scope.verses = [];
        */
 
    //Options
    $scope.showVerseNum = true;

    $scope.writingFor = null;

    $scope.writeNote = function(verse){
        if(verse == $scope.writingFor) {
            $scope.writingFor.writingNoteFor = false;
            $scope.writingFor = null;
            return;
        }
        if($scope.writingFor)
            $scope.writingFor.writingNoteFor = false;

        $scope.writingFor = verse;
        verse.writingNoteFor = true;

        $(function() {
            $('#noteTextarea').focus();
            setTimeout(function() {
                $('#noteTextarea').focus();
            }, 10);
        });
    }

    $scope.saveNotes = function() {
        var notes = _.compact(_.map($scope.verses, function(verse) {
            if(verse.note)
                return { verse : verse.verse, note: verse.note };
        }));

        $http.post('/saveNotes/', { notes: JSON.stringify(notes), passage: thePassage})
            .then(function(res){
                if(res.data == 'OK') {
                    $scope.notesLink = 'http://biblenote.heroku-app.com/';
                    $(function() {
                        $('#linkSaved').show()
                    });
                }
            });
    }
}]);

