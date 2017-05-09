
angular.module('sweeperville', ['geolocation', 'sweeperville.services', 'underscore'])
.controller('locationCtrl', [
    '$scope',
    '$rootScope', 
    '$http', 
    '$state',
    'geolocation',
    'getSchedule',
    'dateService',
    'geolocationService',
    'parkingSpotService',
    'localStorageObjects',
    '_',

    function ($scope, $rootScope, $http, $state, geolocation, getSchedule, dateFunctions, geolocationService, parkingSpotService, localStorageObjects, _) {

    $scope.address;
    $scope.selectedSpot = parkingSpotService.get();
    $scope.moveToday = false;
    $scope.moveTomorrow = false;
    $scope.comparing = false;
    $scope.explanation;
    $scope.locationSweepDate;

    //Gets the list of streets. Need this to be coming from an actual endpoint instead of a fake one once I get the db up and running
    //this is duplicated in listCtrl, but not worth fixing i think since i can get rid of the cleanup once the schedule is in the  db
    getSchedule.get().success(function(data, status, headers, config) {
        sweepSchedule = data.results.collection1;
        //this cleans up the city of somerville endpoint to make it usable- I'll have to clean it up
        //before I put it in the db for real
        angular.forEach(sweepSchedule, function(schedule, index){
            schedule.id = index;
            schedule.concatName = schedule.property1+" "+schedule.property2;
            schedule.sweepDate = {
                sweepDate: schedule.property4,
                instance1: schedule.property4.split(" and")[0],
                instance2: schedule.property4.split(" and")[0] == "1st"?"3rd":"4th",
                day: schedule.property4.split(" ")[3]
            };
        });
                 
       $scope.schedule = _.sortBy(sweepSchedule, 'concatName');
    }).error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        console.log(status);
    });

    //initializes the geolocation and calls services to reverse geocode the coordinates
    geolocation.getLocation().then(function(data){
        $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
        geolocationService.initialize(data.coords.latitude, data.coords.longitude);
        geolocationService.codeLatLng(data.coords.latitude, data.coords.longitude, formatAddress);
        
    });

    //if a new parking spot has been selected in the other view, need to update it in this controller
    $rootScope.$on('newSpotSelected', function() {
        $scope.selectedSpot = parkingSpotService.get();
        compareGeolocation();
    })

    //tidies up the reverse geocoded address to the format I want it in
    var formatAddress = function(results,) {
        if(results[0].address.city !== "Somerville") {
            alert("Sorry! we're not currently serving that area, Sweeperville is only for Somerville, MA");
        }
        ///this figures out which side of the street user is on from the house number in the geolocation data                     
        var houseNumber = Number(results[0].address_components[0].long_name);
        var side;
        if(houseNumber%2 !== 0){
            side = 'odd';
        }else{
            side = 'even';
        }
        address = {
            'city': results[0].address_components[3].long_name,
            'street' : results[0].address_components[1].long_name,
            'side': side
        }
        $scope.address = address
        //need this apply because the geolocation stuff is happening outside of angular so it's not getting
        //captured by the digest cycle
        $scope.$apply();
        //now that the address is loaded and formatted, compare it to the database of streets to see if
        //the user should move their car
        compareGeolocation();
    }
    //call the dateFunctions service to get and format the date (aka put it into instance of day format)
    $scope.todaysDate = dateFunctions.formatDate();
    $scope.tomorrowsDate = dateFunctions.formatFutureDate(1);

    //to match the geolocated address with the db of streets and see if it's getting swept today or soon
    function compareGeolocation(){
        setTimeout(function(){ 
            //finds the street in the list @TODO: should create an endpoint to just retrieve one street
            //at a time so that I don't have to loop through the whole list every time
            angular.forEach($scope.schedule, function(street){
                if($scope.address.street == street.concatName && $scope.address.side == street.property3){
                    $scope.selectedSpot = street;
                    parkingSpotService.set($scope.selectedSpot);
                    $scope.locationSweepDate = street.sweepDate;
                }
                
            });
            //checks if the date that street gets swept is today
            if($scope.locationSweepDate.day == $scope.todaysDate.dayName && $scope.locationSweepDate.instance1 == $scope.todaysDate.instance || $scope.locationSweepDate.instance2 == $scope.todaysDate.instance ){
                $scope.moveToday = true;
                $scope.explanation = "You need to move your car! "+$scope.selectedSpot.concatName+" will be swept today between 8 AM and 12 PM.";

            }
            //or if it is tomorrow
            else if($scope.locationSweepDate.day == $scope.tomorrowsDate.dayNamee && $scope.locationSweepDate.instance1 == $scope.tomorrowsDate.instance || $scope.locationSweepDate.instance2 == $scope.tomorrowsDate.instance){
                $scope.moveTomorrow =true;
                $scope.moveToday = false;
                $scope.explanation = "Youre good to go- "+$scope.selectedSpot.concatName+" was already swept today between 8 AM and 12 PM.";

            }
            //or if it is neither and you can just chill
            else{
                $scope.moveTomorrow = false;
                $scope.moveToday = false;
                $scope.explanation="breathe a sigh of relief- your car can stay put for now.";
            }
           
        }, 2000);
    }

    //have the user confirm that the geolocated spot is correct, since it's not always going to be 100%f
    $scope.acceptSpot = function() {
        parkingSpotService.set($scope.selectedSpot);
        $state.go('tab.parked')
    }


    $scope.compareDate = function(street, date){
        if(!$scope.chooseStreet){
            //call the location if choose street is not selected/////////////////////////
            geolocation.getLocation().then(function(data){
                $scope.coords = {
                    lat:data.coords.latitude, long:data.coords.longitude
                };

                initialize(data.coords.latitude, data.coords.longitude);
                codeLatLng(data.coords.latitude, data.coords.longitude);
           
                compareGeolocation();
            });
      
        } else{
          ///this is the select from list comparison function
          //@TODO these messages should come from an endpoint

            if($scope.selectedSpot.sweepDate.day == $scope.DateToday.dayVerbose && ($scope.selectedSpot.sweepDate.instance1 == $scope.DateToday.instance || $scope.selectedSpot.sweepDate.instance2 == $scope.DateToday.instance) && $scope.DateToday.hour<12){
                $scope.moveToday = true;
                $scope.moveTomorrow = false;
                $scope.explanation = "You need to move your car! "+$scope.selectedSpot.concatName+" will be swept today between 8 AM and 12 PM.";

            }else if($scope.selectedSpot.sweepDate.day == $scope.DateToday.dayVerbose && ($scope.selectedSpot.sweepDate.instance1 == $scope.DateToday.instance || $scope.selectedSpot.sweepDate.instance2 == $scope.DateToday.instance)){
                $scope.moveToday = false;
                $scope.moveTomorrow = false;
                $scope.explanation = "Youre good to go- "+$scope.selectedSpot.concatName+" was already swept today between 8 AM and 12 PM.";
            }else if($scope.selectedSpot.sweepDate.day == $scope.DateTomorrow.dayVerbose && ($scope.selectedSpot.sweepDate.instance1 == $scope.DateTomorrow.instance || $scope.selectedSpot.sweepDate.instance2 == $scope.DateTomorrow.instance)){
                $scope.moveTomorrow =true;
                $scope.moveToday = false;
                $scope.explanation = "Better move you car before tomorrow at 8AM- "+$scope.selectedSpot.concatName+" will be swept tomorrow between 8AM and 12 PM";
            }else{
                $scope.moveTomorrow = false;
                $scope.moveToday = false;
                $scope.explanation="breathe a sigh of relief- your car can stay put for now.";
            }
        }
        $scope.comparing = true;
    };


}])
.controller('ListCtrl', [
    '$scope',
    'getSchedule',
    'parkingSpotService',
    '$state',
    '$rootScope',
    '_',

    function($scope, getSchedule, parkingSpotService, $state, $rootScope, _) {

        getSchedule.get().success(function(data, status, headers, config) {
            sweepSchedule = data.results.collection1;
            //this cleans up the city of somerville endpoint to make it usable- I'll have to clean it up
            //before I put it in the db for real
            angular.forEach(sweepSchedule, function(schedule, index){
                schedule.id = index;
                schedule.concatName = schedule.property1+" "+schedule.property2;
                schedule.sweepDate = {
                    sweepDate: schedule.property4,
                    instance1: schedule.property4.split(" and")[0],
                    instance2: schedule.property4.split(" and")[0] == "1st"?"3rd":"4th",
                    day: schedule.property4.split(" ")[3]
                    };
            });
           //sort the streets alphabetically by name          
           $scope.schedule = _.sortBy(sweepSchedule, 'concatName');
        }).error(function(data, status, headers, config) {
            console.log(status);
        });

        $scope.enterParkingSpot = function(street) {
            $scope.selectedSpot = street;
            //sets the selected spot in the parkingSpotService so it can be retrieved from the other controller 
            parkingSpotService.set(street);
            //need to let the other controller know the value has changed to trigger an update
            $rootScope.$broadcast('newSpotSelected');
            //go to the parked view
            $state.go('tab.parked');
        };
            
    }
])
