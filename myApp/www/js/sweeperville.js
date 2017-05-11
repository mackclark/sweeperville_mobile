
angular.module('sweeperville', ['geolocation', 'sweeperville.services', 'underscore'])
.controller('locationCtrl', [
    '$scope',
    '$rootScope', 
    '$http', 
    '$state',
    '$timeout',
    'geolocation',
    'getSchedule',
    'dateService',
    'geolocationService',
    'parkingSpotService',
    'localStorageObjects',
    '_',

    function ($scope, $rootScope, $http, $state, $timeout, geolocation, getSchedule, dateFunctions, geolocationService, parkingSpotService, localStorageObjects, _) {

    $scope.address;
    $scope.selectedSpot = parkingSpotService.get();
    $scope.moveToday;
    $scope.moveTomorrow;
    $scope.comparing = false;
    $scope.explanation;
    $scope.schedule;

     //call the dateFunctions service to get and format the date (aka put it into instance of day format)
    $scope.todaysDate = dateFunctions.formatDate();
    $scope.tomorrowsDate = dateFunctions.formatFutureDate(1);

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
       if($scope.selectedSpot) {
            checkForSweeping()
       }
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

    //tidies up the reverse geocoded address to the format I want it in
    var formatAddress = function(results) {
        if(results[0].address_components[3].long_name !== "Somerville") {
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
        if(address.city === 'Somerville') {
            $scope.address = address
        }
        //need this apply here because the geolocation stuff is happening outside of angular so it's not getting
        //captured by the digest cycle
        $scope.$apply();
        //now that the address is loaded and formatted, compare it to the database of streets to see if
        //the user should move their car
    }

    //if a new parking spot has been selected in the other view, need to update it in this controller
    $rootScope.$on('newSpotSelected', function() {
        $scope.selectedSpot = parkingSpotService.get();
        checkForSweeping()
    })

    //to match the geolocated address with the db of streets and see if it's getting swept today or soon
    function compareGeolocation(){
        //finds the street in the list @TODO: when I have a db I should create an endpoint to just retrieve one street
        //at a time so that I don't have to loop through the whole list every time
        angular.forEach($scope.schedule, function(street){
            if($scope.address.street == street.concatName && $scope.address.side == street.property3){
                $scope.selectedSpot = street;
                parkingSpotService.set($scope.selectedSpot);
            }
            
        });
        checkForSweeping()
    }

    //figures out if user will need to move car to avoid streetsweeping
    function checkForSweeping() {
        //checks if the date that street gets swept is today
        if($scope.selectedSpot.sweepDate.day == $scope.todaysDate.dayName && $scope.todaysDate.hour < 12 && ($scope.selectedSpot.sweepDate.instance1 == $scope.todaysDate.instance || $scope.selectedSpot.sweepDate.instance2 == $scope.todaysDate.instance )){
            $scope.moveToday = true;
        }
        //or if it is tomorrow
        else if($scope.selectedSpot.sweepDate.day == $scope.tomorrowsDate.dayName && ($scope.selectedSpot.sweepDate.instance1 == $scope.tomorrowsDate.instance || $scope.selectedSpot.sweepDate.instance2 == $scope.tomorrowsDate.instance)){
            $scope.moveTomorrow =true;
            $scope.moveToday = false;
        }
        //or if it is neither and you can just chill
        else{
            $scope.moveTomorrow = false;
            $scope.moveToday = false;
        }    
    }

    //have the user confirm that the geolocated spot is correct, since it's not always going to be 100%
    $scope.acceptSpot = function() {
        compareGeolocation();
        $timeout(function() {
             $state.go('tab.parked')
        })
       
    }


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
