var fs = require('fs'),
eyes = require('eyes'),
xml2js = require('xml2js');
var request = require('request');

var stationBaseURL = "https://abo-dublin.cyclocity.fr/service/stationdetails/dublin/";

var interestingStationsDict = [
	{id: 18, name: "Grantham St.", distance:11 },
	{id: 34, name: "Portobello Hbr.", distance:12 },
	{id: 43, name: "Portobello Rd.", distance:9 },
	{id: 17, name: "Golden Ln.", distance:14 },
	{id: 5, name:"Charlemont St.", distance:16}
];

var stationResults = new Array();

queryEachStation();

function queryEachStation(){
	//console.log(interestingStationsDict);
	for(var key in interestingStationsDict){
		var name = interestingStationsDict[key]["name"];
		var id = interestingStationsDict[key]["id"];
		var distance = interestingStationsDict[key]["distance"];
		doRequest(id,name,distance);	

	}
}

function doRequest(id,name,distance){
	request({ uri:stationBaseURL+id }, function (error, response, body) {
		if (error && response.statusCode !== 200) {
			//console.log('Error when contacting google.com')
		}
		//console.log(name);
		//console.log(body);
		var parser = new xml2js.Parser();

		parser.on('end', function(result){
			eyes.inspect(result);
		});

		var resultFunc = handleRawData;
		//resultFunc.apply(name);
		parser.parseString(body,function(err,result){handleRawData(err,result,name,distance)});
		writeOutput();
	});
}

function handleRawData(err, result, stationName, distance){
	var thisStation = result['station'];

	var details = new StationStatus(stationName,distance,thisStation['free'][0],thisStation['total'][0],thisStation['open'][0]);
	stationResults.push(details);
}

function StationStatus(stationName, distance, freeStands, totalStands, isOpen){
	this.stationName = stationName;
	this.distanceMins = distance;
	this.totalStands = totalStands;
	this.availableBikes = totalStands-freeStands;
	this.isOpen = isOpen;
}

function writeOutput(){
	 fs.writeFile("/home/jack/bikes.txt",JSON.stringify(stationResults));
}