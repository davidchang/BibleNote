var App = angular.module('App', ['ngSanitize']);

App.controller('TodoCtrl', function($scope, $http) {
    $scope.todos = [];

    if(theText) {
        $scope.todos = JSON.parse(theText);
    }
    else {
        $http.get('/get/' + thePassage)
            .then(function(res){
                $scope.todos = res.data;
            });
    }

    $scope.notes = [];

    //Options
    $scope.showVerseNum = true;
    $scope.showVersesPerLine = false;

    $scope.writingFor = null;
    $scope.verseSelected = false;

    $scope.writeNote = function(todo){
        if($scope.writingFor)
            $scope.writingFor.writingNoteFor = false;

        $scope.verseSelected = true;
        $scope.writingFor = todo;
        todo.writingNoteFor = true;

        $(function() {
            $('#note').focus();
            /*
            var p = $('#' + todo.verse).position();
            $('#addNote').css('top', p.top).removeClass('hidden');
            */
        });
    }

    $scope.saveNote = function() {
        $scope.notes.push({ verse: $scope.writingFor, note: $scope.note});
        $scope.note = ""; $scope.writingFor = null;
        $('#addNote').addClass('hidden');

        fixNotes();
    }

    var fixNotes = function() {
        for(var i = 0; i < $scope.notes.length; ++i) {
            var verseNum = $scope.notes[i].verse;
            var y = $('#' + verseNum).position().top;

            $('#note' + verseNum).css('margin-top', y);
        }
    }
});
