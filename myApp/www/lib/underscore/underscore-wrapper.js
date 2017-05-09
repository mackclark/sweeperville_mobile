//thanks to satchmorun for the wrapper: http://stackoverflow.com/questions/14968297/use-underscore-inside-angular-controllers
angular.module('underscore', [])

.factory('_', [
    '$window',
    function($window) {
        return $window._;
    }
]);