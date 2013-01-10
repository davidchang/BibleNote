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
    }
}
module.exports = utils;
