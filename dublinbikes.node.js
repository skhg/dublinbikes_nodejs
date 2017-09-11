var fs = require('fs');
var eyes = require('eyes'); //for debug use
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
Functions to do searching for things
*/

exports.getAllStations = function(onLoaded){
	var stationsListURL = "http://www.dublinbikes.ie/service/carto"

	sendQuery(stationsListURL, readStationList, onLoaded)
}

exports.getStationStatus = function(stationID, onLoaded){
	var stationBaseURL = "http://www.dublinbikes.ie/service/stationdetails/dublin/";

	sendQuery(stationBaseURL+stationID,readStationStatus, onLoaded);
}

exports.findClosestStation = function(myLat, myLong, openOnly, limit, onFound){

	this.getAllStations(function(stations){
		onFound(getClosestToLatLng(stations, myLat, myLong, limit, openOnly));
	});
}

exports.findClosestBike = function(myLat, myLong, stationsLimit, minimumBikes, onFound){

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

	});
}
