var utils = {
    cleanPassageTitle: function(word) {
        var trimmed = word.replace(/^\s+|\s+$/g, '');
        return trimmed.replace(/(^[a-z]|[ .,\(\)\[\]]+[a-z])/g, function(s) {
            return s.toUpperCase();
        });
    },

    findScriptureMatch: function(text) {
        var passageRegex = /^([0-9]*)([a-zA-Z]+)([0-9]+)$/;
        return passageRegex.exec(text);
    },

    render: function(req, res, view) {
        var match = this.findScriptureMatch(req.params.text);

        var onFailure = function() {
            res.redirect('/');
        };

        if(match) {
            var passage = this.cleanPassageTitle(match.slice(1).join(' '));
            res.render(view, { title: passage });
        }
        else
            onFailure();
    }
}
module.exports = utils;
