'use strict';

App.controller('BibleNoteCtrl', ['$scope', 'Bible', function($scope, Bible) {
    $scope.notes = [];

    $scope.noteId = 0;

    $scope.currentNote = '';
    $scope.sermonTitle = 'Title1';
    $scope.sermonSpeaker = 'Speaker1';

    var savedSermonTitle = null;

    $scope.saveNote = function() {

        if(!$scope.currentNote.length)
            return;

        $scope.notes.push({text: $scope.currentNote, id: ++$scope.noteId});
        $scope.currentNote = '';

        Bible.saveSermonNotes({
            notes: $scope.notes,
            title: $scope.sermonTitle,
            speaker: $scope.sermonSpeaker,
            oldTitle: !savedSermonTitle || savedSermonTitle == $scope.sermonTitle ? null : savedSermonTitle
        }, function(error, res) {
            console.log(res);

            savedSermonTitle = $scope.sermonTitle;
        });
    }
}]);
