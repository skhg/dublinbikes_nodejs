var bike_api = require('./dublinbikes.node.js');
var eyes = require('eyes');



/*
Helper functions to quickly print stuff
*/
printStationsList = function(){
	bike_api.getAllStations(console.log);
}

printStationStatus = function(stationID){
	bike_api.getStationStatus(stationID, console.log);
}

printClosestStation = function(myLat, myLong, openOnly, limit = 1){
	bike_api.findClosestStation(myLat, myLong, openOnly, limit, console.log);
}

printClosestBike = function(myLat, myLong, minimumBikes, limit = 5){
	bike_api.findClosestBike(myLat, myLong, limit, minimumBikes, (x)=>{eyes.inspect(x)});
}





// printStationsList();
// printStationStatus(1);
// printClosestStation(53.342451, -6.266667, false);
// printClosestBike(53.342451, -6.266667, 2, 2);
