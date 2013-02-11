'use strict';

App.controller('BibleNoteCtrl', ['$scope', 'Bible', function($scope, Bible) {
    $scope.notes = [];

    $scope.noteId = 0;

    $scope.currentNote = '';

    $scope.saveNote = function() {
        if($scope.currentNote.length) {
            $scope.notes.push({text: $scope.currentNote, id: ++$scope.noteId});
            $scope.currentNote = '';
        }
    }
}]);
