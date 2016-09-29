
var Vue = window.Vue;

module.exports = Vue.extend({
    props: {
        tit: {
            type: String
        }
    },

    data: function() {
        return {
            a: 1
        };
    }
});
