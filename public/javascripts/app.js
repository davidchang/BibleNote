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

    $scope.writingFor = null;

    $scope.writeNote = function(todo){
        if(todo == $scope.writingFor) {
            $scope.writingFor.writingNoteFor = false;
            $scope.writingFor = null;
            return;
        }
        if($scope.writingFor)
            $scope.writingFor.writingNoteFor = false;

        $scope.writingFor = todo;
        todo.writingNoteFor = true;

        $(function() {
            $('#noteTextarea').focus();
            setTimeout(function() {
                $('#noteTextarea').focus();
            }, 10);
            /*
                var p = $('#' + todo.verse).position();
                $('#addNote').css('top', p.top).removeClass('hidden');
            */
        });
    }

    var fixNotes = function() {
        for(var i = 0; i < $scope.notes.length; ++i) {
            var verseNum = $scope.notes[i].verse;
            var y = $('#' + verseNum).position().top;

            $('#note' + verseNum).css('margin-top', y);
        }
    }

    $scope.saveNotes = function() {
        var notes = _.compact(_.map($scope.todos, function(verse) {
            if(verse.note)
                return { verse : verse.verse, note: verse.note };
        }));

        $http.post('/saveNotes/', { notes: JSON.stringify(notes), passage: thePassage})
            .then(function(res){
                console.log(res);
            });
    }
});
