'use strict';

App.controller('BibleNoteCtrl', ['$scope', 'Bible', function($scope, Bible) {
    //Data
    Bible.getText(thePassage, notes, function(json) {
        $scope.verses = json.data.theText;
    });

    //Options
    $scope.showVerseNum = true;
    $scope.verseGetsOwnLine = false;

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
            $('#noteTextArea').focus();
            setTimeout(function() {
                $('#noteTextArea').focus();
            }, 10);
        });
    }

    $scope.saveNotes = function() {
        var notes = _.compact(_.map($scope.verses, function(verse) {
            if(verse.note)
                return { verse : verse.verse, note: verse.note };
        }));

        Bible.saveNotes(JSON.stringify(notes), thePassage, function(error, res) {
            if(error)
                return;

            $scope.notesLink = 'http://biblenote.heroku-app.com/';
            $(function() {
                $('#linkSaved').removeClass('hidden');
                $('#closeAlertButton').click(function() {
                    $('#linkSaved').addClass('hidden');
                    $(this).off('click');
                });
            });
        });
    }
}]);

