'use strict';

App.controller('BibleNoteCtrl', ['$scope', 'Bible', function($scope, Bible) {
    Bible.getSermons(function(sermons) {
        $scope.sermons = sermons.data.sermons;
    });
}]);
