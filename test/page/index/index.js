
var reg = /'<header': \w+\('(.*)'\)/g;
new Vue({
    components: {
        'header-banner': require('/test/widget/header-banner/header-banner.js'),
        'second-header-banner': require('/test/widget/header-banner/header-banner.js')
    }
});
