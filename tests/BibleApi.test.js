var vows = require('vows')
    , assert = require('assert')
    , BibleApi = require('../BibleApi');

function makeCall(text, cb) {
    BibleApi.get(text, cb);
}

function assertGoodResponse(error, data, length) {
    assert.equal(error, null);
    assert.equal(typeof(data), 'object');
    if(length != null)
        assert.equal(data.length, length);
}
function assertBadResponse(error, data) {
    assert.equal(typeof(error), 'string');
    assert.equal(data, null);
}

vows.describe('api tests').addBatch({
    'when making a call to get an existing chapter': {
        topic: function() {
            makeCall('Nahum 1', this.callback);
        },
        'we should receive no errors and get data back': function(error, data) {
            assertGoodResponse(error, data, 15);
        }
    },
    'when making a call to get an existing verse segment': {
        topic: function() {
            makeCall('Nahum 1:1-5', this.callback);
        },
        'we should receive no errors and get data back': function(error, data) {
            assertGoodResponse(error, data, 5);
        }
    },
    'when making a call to get a nonexistent passage': {
        topic: function() {
            makeCall('Nahum 25', this.callback);
        },
        'we should receive an error and no results': function(error, data) {
            assertBadResponse(error, data);
        }
    },
    'when making a call to get just a random string': {
        topic: function() {
            makeCall('sdghwefhisdglhdsf', this.callback);
        },
        'we should receive an error and no results': function(error, data) {
            assertBadResponse(error, data);
        }
    }
}).run();
