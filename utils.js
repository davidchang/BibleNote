var utils = {
    clean: function(word) {
        var trimmed = word.replace(/^\s+|\s+$/g, '');
        return trimmed.replace(/(^[a-z]|[ .,\(\)\[\]]+[a-z])/g, function(s) {
            return s.toUpperCase();
        });
    },

    getBookName: function(match) {
        var name = match.slice(1, match.length - 1).join(' ');
        name = this.clean(name).toLowerCase();
        return name;
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
            var passage = utils.clean(match.slice(1).join(' '));
            res.render(view, { title: passage });
        }
        else
            onFailure();
    }
}
module.exports = utils;
