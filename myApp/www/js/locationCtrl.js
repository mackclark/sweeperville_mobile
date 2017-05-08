
angular.module('sweeperville', ['geolocation', 'sweeperville.services'])
.controller('locationCtrl', [
    "$scope", 
    '$http', 
    'geolocation',
    'getSchedule',
    'dateFunctions',
    'geolocationService',

    function ($scope, $http, geolocation, getSchedule, dateFunctions, geolocationService) {

    $scope.address;
    $scope.selectedSpot = "";
    $scope.moveToday = false;
    $scope.moveTomorrow = false;
    $scope.comparing = false;
    $scope.explanation;
    $scope.locationSweepDate; 

    //***********************************************************//
    //   GETS THE LIST OF STREETS
    //***********************************************************//
    //this is duplicated in listCtrl, but not worth fixing i think since i can get rid of the cleanup once the schedule is in the  db
    getSchedule.get().success(function(data, status, headers, config) {
        sweepSchedule = data.results.collection1;
        //this cleans up the city of somerville endpoint to make it usable- I'll have to clean it up
        //before I put it in the db for real
        angular.forEach(sweepSchedule, function(schedule){
            schedule.concatName = schedule.property1+" "+schedule.property2;
            schedule.sweepDate = {
                sweepDate: schedule.property4,
                instance1: schedule.property4.split(" and")[0],
                instance2: schedule.property4.split(" and")[0] == "1st"?"3rd":"4th",
                day: schedule.property4.split(" ")[3]
                };
        });
                 
       $scope.schedule = sweepSchedule;
    }).error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        console.log(status);
    });

    //geolocate user and translate coords into address, initialize map
    geolocation.getLocation().then(function(data){
        $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
        geolocationService.initialize(data.coords.latitude, data.coords.longitude);
        $scope.address = geolocationService.codeLatLng(data.coords.latitude, data.coords.longitude);
        console.log($scope.address)
    }); //get location
    


    ///////here's the geolocation stuff, it should probably be in a service
    
    

    
    
    function compareGeolocation(){
        setTimeout(function(){ 
            angular.forEach($scope.schedule, function(street){
              if($scope.address.street == street.concatName && $scope.address.side == street.property3){
                $scope.locationSweepDate = street.sweepDate;
              }
                
            });
            if($scope.locationSweepDate.day == $scope.DateToday.dayVerbose && $scope.locationSweepDate.instance1 == $scope.DateToday.instance || $scope.locationSweepDate.instance2 == $scope.DateToday.instance ){
              $scope.moveToday = true;
              $scope.moveTomorrow = false;
            }else if($scope.locationSweepDate.day == $scope.DateTomorrow.dayVerbose && $scope.locationSweepDate.instance1 == $scope.DateTomorrow.instance || $scope.locationSweepDate.instance2 == $scope.DateTomorrow.instance){
              $scope.moveTomorrow =true;
              $scope.moveToday = false;
            }else{
              $scope.moveTomorrow = false;
              $scope.moveToday = false;
            }
           $scope.$apply($scope.locationSweepDate);
           
           $scope.comparing = true;

        }, 2000);
    }
    $scope.todaysDate = dateFunctions.formatDate();


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

    function($scope, getSchedule) {

        getSchedule.get().success(function(data, status, headers, config) {
            sweepSchedule = data.results.collection1;
            //this cleans up the city of somerville endpoint to make it usable- I'll have to clean it up
            //before I put it in the db for real
            angular.forEach(sweepSchedule, function(schedule){
                schedule.concatName = schedule.property1+" "+schedule.property2;
                schedule.sweepDate = {
                    sweepDate: schedule.property4,
                    instance1: schedule.property4.split(" and")[0],
                    instance2: schedule.property4.split(" and")[0] == "1st"?"3rd":"4th",
                    day: schedule.property4.split(" ")[3]
                    };
            });
                     
           $scope.schedule = sweepSchedule;
        }).error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            console.log(status);
        });

        $scope.enterParkingSpot = function (street){
          $scope.selectedSpot = $('[type="radio"]:checked').val();
              $scope.selectedSpot = jQuery.parseJSON($scope.selectedSpot);
        };
            
    }
])







// need to process date to figure out what number day of the month it is
//need to maybe process the dates in the schedule data into some more manageable format
//compare the two to see if street will be swept
//maybe make a map showing which streets will be swept upcoming

//http://blog.challengepost.com/post/124154812036/no-api-no-problem-fake-it-with-browser?utm_source=ChallengePost+New+Competitions+Newsletter&utm_campaign=312e982097-Hacker_07_16_15&utm_medium=email&utm_term=0_294421ffd0-312e982097-225284717
