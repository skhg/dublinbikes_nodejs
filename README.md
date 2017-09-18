dublinbikes_nodejs
=

[![Build Status](https://travis-ci.org/skhg/dublinbikes_nodejs.svg?branch=master)](https://travis-ci.org/skhg/dublinbikes_nodejs) [![Coverage Status](https://coveralls.io/repos/github/skhg/dublinbikes_nodejs/badge.svg?branch=master)](https://coveralls.io/github/skhg/dublinbikes_nodejs?branch=master) [![Dependencies](https://david-dm.org/skhg/dublinbikes_nodejs.svg)](https://david-dm.org/skhg/dublinbikes_nodejs.svg) [![Known Vulnerabilities](https://snyk.io/test/github/skhg/dublinbikes_nodejs/badge.svg)](https://snyk.io/test/github/skhg/dublinbikes_nodejs)

A small [node.js](https://nodejs.org/en/) utility designed to retrieve status information from the [DublinBikes](http://www.dublinbikes.ie/) bike-sharing service. The API provides methods to:
* Get the list of all stations
* Get status information for a station
* Find the nearest stations to a given latitude/longitude
* Find the nearest available bike to a given latitude/longitude

Requirements
==
node.js with the following modules
* xml2js
* request
* eyes

Use
==
Download to your machine and uncomment the lower lines in test.js to begin playing with it. Run with `node test.js`
