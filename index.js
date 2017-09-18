'use strict';

var xml2js = require('xml2js');
var request = require('request');

/*
Internal functions to do the requests
*/

function sendQuery(url, processWebData, handleOutput){
	request({ uri:url }, function (error, response, body) {
		if (error && response.statusCode !== 200) {
			console.err("Error "+response.statusCode+" : "+error)
		}

		var parser = new xml2js.Parser();
		
		parser.parseString(body, function(err,result){ processWebData(result,handleOutput)});
	});
}

function readStationList(webResponse, handleResult){
	allMarkers = webResponse["carto"]["markers"][0]["marker"];
	results = []

	for (var i = 0; i < allMarkers.length; i++) {
		results.push(allMarkers[i]["$"])
	};

	handleResult(results);
}

function readStationStatus(webResponse, handleResult){
	handleResult(webResponse["station"]);
}

function getDistanceFromPoint(station, myLat, myLong){
	stationLat = parseFloat(station["lat"]);
	stationLong = parseFloat(station["lng"]);

	mylat = parseFloat(myLat);
	myLong = parseFloat(myLong);

	return Math.sqrt(Math.pow((myLat - stationLat),2) + Math.pow((myLong - stationLong),2));
}

function sortStationsByDistance(stationsList, myLat, myLong){
	sortedList = [];

	for (var i = 0; i < stationsList.length; i++) {
		distance = getDistanceFromPoint(stationsList[i], myLat, myLong);

		sortedList.push([stationsList[i],distance]);
	};

	return sortedList.sort(function(a,b){
		return a[1] - b[1]
	}).map( function(x) {
		return x[0];
	} );
}

function getClosestToLatLng(stationsList, myLat, myLong, limit, openOnly){
	
	stationsList = sortStationsByDistance(stationsList,myLat,myLong);

	closest = [];
	closestDist = Number.MAX_VALUE;

	for (var i = 0; i < stationsList.length; i++) {
		if(closest.length == limit){
			break;
		}

		if(openOnly){
			stationOpen = stationsList[i]["open"];

			if(stationOpen!="1"){
				continue;
			}
		}

		closest.push(stationsList[i]);
	};

	return closest;
}

function getBikesAtStation(station){
	return parseInt(station["available"]);
}

function makeNewPromiseWithID(id, funcRef, info){
	var myPromise = new Promise((resolve)=>{
		funcRef(id,(result)=>{
			resolve([result,info]);
		});
	});

	return myPromise;
}




/*
Public functions
---------------------
*/





/**
 * Do a web request to return a current list of all DublinBikes stations
 *
 * @param {function} onLoaded What to do with the list of loaded stations
 */
exports.getAllStations = function(onLoaded){
	var stationsListURL = "http://www.dublinbikes.ie/service/carto"

	sendQuery(stationsListURL, readStationList, onLoaded)
}

/**
 * Do a web request to return the current status of one station
 *
 * @param {number} stationID The station number to look up
 * @param {function} onLoaded What to do with the loaded status info
 */
exports.getStationStatus = function(stationID, onLoaded){
	var stationBaseURL = "http://www.dublinbikes.ie/service/stationdetails/dublin/";

	sendQuery(stationBaseURL+stationID,readStationStatus, onLoaded);
}

/**
 * Find the closest DublinBikes stations to a given latitude/longitude
 *
 * @param {number} myLat A latitude in decimal format (e.g. 53.342451)
 * @param {number} myLong A longitude in decimal format (e.g. -6.266667)
 * @param {boolean} openOnly Filter for only stations which are currently open
 * @param {number} limit Limit the number of stations returned in the list
 * @param {function} onFound What to do with the found status info
 * @param {array} stations (Optional) provide a list of stations to search. If left blank we do a web query to retrieve them
 */
exports.findClosestStation = function(myLat, myLong, openOnly, limit, onFound, stations=null){

	if(stations==null){
		this.getAllStations(function(stations){
			onFound(getClosestToLatLng(stations, myLat, myLong, limit, openOnly));
		});
	}else{
		onFound(getClosestToLatLng(stations, myLat, myLong, limit, openOnly));
	}
	
}

/**
 * Find the closest DublinBike bicycles that are currently available
 *
 * @param {number} myLat A latitude in decimal format (e.g. 53.342451)
 * @param {number} myLong A longitude in decimal format (e.g. -6.266667)
 * @param {number} stationsLimit Limit the number of stations to search
 * @param {number} minimumBikes Exclude any stations with available bikes under this limit
 * @param {function} onFound What to do with the found bike information
 * @param {array} stations (Optional) provide a list of stations to search. If left blank we do a web query to retrieve them
 */
exports.findClosestBike = function(myLat, myLong, stationsLimit, minimumBikes, onFound, stations=null){

	this.findClosestStation(myLat, myLong, true, stationsLimit, (stationsList)=>{
		
		allPromises = [];

		for (var i = 0; i < stationsList.length; i++) {
			stationID = stationsList[i]["number"];
			
			myPromise = makeNewPromiseWithID(stationID, this.getStationStatus,stationsList[i]);
			allPromises.push(myPromise);
		};

		Promise.all(allPromises).then((results)=>{

			first = results[0];

			filteredForAvailability = results.filter(function(item){
				return item[0]["available"][0] >= minimumBikes;
			});

			onFound(filteredForAvailability);
		});

	}, stations);
}
