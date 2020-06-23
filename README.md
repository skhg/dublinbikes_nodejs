dublinbikes_nodejs
=

[![Build Status](https://travis-ci.org/skhg/dublinbikes_nodejs.svg?branch=master)](https://travis-ci.org/skhg/dublinbikes_nodejs) [![Coverage Status](https://coveralls.io/repos/github/skhg/dublinbikes_nodejs/badge.svg?branch=master)](https://coveralls.io/github/skhg/dublinbikes_nodejs?branch=master) [![Dependencies](https://david-dm.org/skhg/dublinbikes_nodejs.svg)](https://david-dm.org/skhg/dublinbikes_nodejs.svg) [![Known Vulnerabilities](https://snyk.io/test/github/skhg/dublinbikes_nodejs/badge.svg)](https://snyk.io/test/github/skhg/dublinbikes_nodejs) [![npm](https://img.shields.io/npm/dt/dublinbikes_js.svg)](https://www.npmjs.com/package/dublinbikes_js)

[![NPM](https://nodei.co/npm/dublinbikes_js.png)](https://nodei.co/npm/dublinbikes_js/)

A [node.js](https://nodejs.org/en/) module designed to retrieve status information from the [DublinBikes](http://www.dublinbikes.ie/) bike-sharing service. The API provides methods to:
* Get the list of all stations
* Get status information for a station
* Find the nearest stations to a given latitude/longitude
* Find the nearest available bike to a given latitude/longitude

This is an unofficial module and the author/contributors are in no way connected to the DublinBikes organisation.

## Installation
`npm install dublinbikes_js`

## Usage
It's really easy to use. All methods return JSON objects.

### Require it and create a new instance.
(Use [eyes](https://www.npmjs.com/package/eyes)) to preview results):
```js
var bike_api = require('dublinbikes_js');
var eyes = require('eyes');
```

### Get the list of all stations:
```js
bike_api.getAllStations((x)=>{console.log(x)});
```
(Returns a long list of stations)


### Get the current status for a station:
```js
var stationID = 2;
bike_api.getStationStatus(stationID, (x)=>{eyes.inspect(x)});
```
Returns something like:
```js
{
    available: [ '14' ],
    free: [ '6' ],
    total: [ '20' ],
    ticket: [ '1' ],
    open: [ '1' ],
    updated: [ '1505761025' ],
    connected: [ '1' ]
}
```
### Find the closest station to a location:
Location in decimal latitude/longitude. Optionally we can restrict the search to only stations which are currently open, and limit the search to return the _n_ closest stations.
```js
bike_api.findClosestStation(53.342451, -6.266667, true, 1, (x)=>{eyes.inspect(x)});
```
Returns something like:
```js
[
    {
        name: 'DAME STREET',
        number: '10',
        address: 'Dame Street',
        fullAddress: 'Dame Street  ',
        lat: '53.344007',
        lng: '-6.266802',
        open: '1',
        ticket: '1',
        bonus: '0'
    }
]
```

### Find the closest station that has available bikes:
Location in decimal latitude/longitude. We can show the _n_ closest stations that have bikes available, and we can also filter to only show stations that have _m_ or more bikes available.
```js
bike_api.findClosestBike(53.342451, -6.266667, 1, 2, (x)=>{eyes.inspect(x)});
```
Returns a result like:
```js
[
    [
        {
            available: [ '2' ],
            free: [ '14' ],
            total: [ '16' ],
            ticket: [ '1' ],
            open: [ '1' ],
            updated: [ '1505768043' ],
            connected: [ '1' ]
        },
        {
            name: 'DAME STREET',
            number: '10',
            address: 'Dame Street',
            fullAddress: 'Dame Street  ',
            lat: '53.344007',
            lng: '-6.266802',
            open: '1',
            ticket: '1',
            bonus: '0'
        }
    ]
]
```




## Tests

  `npm test`

## Contributing
Fork this repo, make some changes and create a new pull request!
