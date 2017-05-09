angular.module('sweeperville.services', [])
.service('getSchedule', [
    "$http",

    function($http) {

      //this will eventually go in the db, this is just a temp solution
        citySchedule = 'somervilleschedule.json';
        this.get = function() {
            if(citySchedule){
                return $http.get(citySchedule);
            }
        }
        
}])
.service('parkingSpotService', [
    'localStorageObjects',

    function(localStorageObjects) {

    var currentSpot = localStorageObjects.getByKey('parkingSpot') ? localStorageObjects.getByKey('parkingSpot') : null;

    this.set = function(spot) {
        currentSpot = spot;
        localStorageObjects.setByKey('parkingSpot', spot)
    }

    this.get = function() {
        return currentSpot;
    }
}])
.service('dateService', [

  function() {

    //though it has been heavily refactored, credit to Dan Budris for writing the original date formatting code this is based on: https://github.com/danbudris
    function GetDateObject(days, dates, months, years, hour) {
        var Dateobject = {
            month: 0,
            day: 0,
            date:0,
            year: 0,
            hour: 0,

            monthName:"0",
            dayName:"0",
            dateInstance:"0"
        }; 

      //@TODO: make this into a constants service
        var weekday = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ]
       //@TODO ditto this
        var monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
         ]

        //turns the date into it's instance of day (1st wed, 4th tue, etc)
        var newdate = (weekday[days]+", "+monthNames[months]+" "+dates+", "+years);
        var ordinalsVerbose = ["","1st","2nd","3rd","4th","5th"];
        var tokens = newdate.split(/[ ,]/);
        var instance = (ordinalsVerbose[Math.ceil(tokens[3]/7)]+" "+ tokens[0]);
        var instance2 = (ordinalsVerbose[Math.ceil(tokens[3]/7)]);

        Dateobject.month = months;
        Dateobject.day = days;
        Dateobject.year = years;
        Dateobject.date = dates;
        Dateobject.instance = instance2;

        Dateobject.dayName = weekday[days];
        Dateobject.monthName = monthNames[months];
        Dateobject.hour = hour;

        Dateobject.dateInstance = instance;

        return Dateobject;
    };

   
    this.formatDate = function() {
        var today = new Date();
        var tdyDay = today.getDay();
        var tdyDate = today.getDate();
        var tdyMonth = today.getMonth();
        var tdyYear = today.getFullYear(); 
        var tdyTime = today.getHours(); 
        dateObjectToday = GetDateObject(tdyDay,tdyDate,tdyMonth, tdyYear, tdyTime);
        return dateObjectToday;
    };

    //here same as above
    this.formatFutureDate = function(days) {
        var futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        var futureDateDay= futureDate.getDay();
        var futureDateDate = futureDate.getDate();
        var futureDateMonth = futureDate.getMonth();
        var futureDateYear = futureDate.getFullYear();
        dateObjectFutureDate = GetDateObject(futureDateDay, futureDateDate, futureDateMonth, futureDateYear);
        return dateObjectFutureDate;
    };
    
    
    //$scope.TodaysDate = dateObjectToday.dateVerbose;



  }])
.service('geolocationService', [
  'geolocation',

  function(geolocation) {
    var geocoder = new google.maps.Geocoder();
    var map;
    var infowindow = new google.maps.InfoWindow();
    var marker;

    this.initialize = function(latitude, longitude) {
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 8,
            center: {lat: latitude, lng: longitude}
        });
    }

      //translate coordinates into street address
    this.codeLatLng = function(latitude, longitude, callback) {

        var lat = latitude;
        var lng = longitude;
        var latlngStr = [ lat, lng];
        var input = lat+lng;
        var latlng = new google.maps.LatLng(latlngStr[0], latlngStr[1]);

        geocoder.geocode({'location': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                     //the lower the number here, the further out the map is zoomed
                    map.setZoom(18);
                    marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    infowindow.setContent(results[1].formatted_address);
                    infowindow.open(map, marker);

                    callback(results)
                } else {
                    console.log('No results found');
                    showList();
                }
            }else {
                console.log('Geocoder failed due to: ' + status);
                showList();
            }
        });
    }
}])
.factory("localStorageObjects", [
    "$window", 

    function($window) {
    return {
        getByKey: getByKey,
        setByKey: setByKey,
        removeByKey: removeByKey,
        clearDB: clearDB,
    };

    //check if the val is in storage before we try to access it
    function checkValExists(val, valName) {
        if(!val) throw Error(valName + " must be specified");
    }

    //get val from storage 
    function getByKey(key) {
        checkValExists(key, "Key");
        var resultVal = JSON.parse($window.localStorage.getItem(key));
        return resultVal !== null ? resultVal : {};
    }
    //set val in storage
    function setByKey(key, data) {
        checkValExists(key, "Key");
        $window.localStorage.setItem(key, (typeof data === "object" ? JSON.stringify(data) : data));
    }
    //remove val from storage
    function removeByKey(key) {
        checkValExists(key, "Key");
        $window.localStorage.removeItem(key);
    }
    //clear storage- not used right now, but in case I ever implement a db I'd need to invoke this on logout
    function clearDB() {
        $window.localStorage.clear();
    }

}]);
