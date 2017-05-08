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

    function() {

    var currentSpot;

    this.set = function(spot) {
        currentSpot = spot;
    }
    this.get = function() {
        return currentSpot;
    }
}])
.service('dateService', [

  function() {

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

    }; //End get date object

    //is there a way to get all this one date object without having to do all this getDay() shit?
   
    this.formatDate = function() {
        var today = new Date();
        var tdyDay = today.getDay();
        var tdyDate = today.getDate();
        var tdyMonth = today.getMonth();
        var tdyYear = today.getFullYear(); 
        var tdyTime = today.getHours(); 
        dateObjectToday = GetDateObject(tdyDay,tdyDate,tdyMonth, tdyYear, tdyTime);
        return dateObjectToday;
    } 

    //here same as above
    // var tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // var tmrwDay= tomorrow.getDay();
    // var tmrwDate = tomorrow.getDate();
    // var tmrwMonth = tomorrow.getMonth();
    // var tmrwYear = tomorrow.getFullYear();
    // dateObjectTomorrow = GetDateObject(tmrwDay, tmrwDate, tmrwMonth, tmrwYear);
    //$scope.DateTomorrow = dateObjectTomorrow;
    
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
