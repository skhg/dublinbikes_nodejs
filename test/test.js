'use strict';

const expect = require('chai').expect;
var rewire = require('rewire');

var api = rewire('../index.js');
 
var parseXMLresponse = api.__get__('parseXMLresponse'); 

describe('parseXMLresponse', () => {
	it('should not call processData if any error exists', () => {
		parseXMLresponse("myErr", undefined, undefined, (d)=>{}, (h)=>{throw "Should not be called"}, e=>{});
	});

	it('should log an error if the web result contains one', () => {
		var errorOut;
		parseXMLresponse("myErr", undefined, undefined, (d)=>{}, (h)=>{}, e=>{errorOut=e});

		expect(errorOut).to.equal("Error: myErr");
	});

	it('should not call processData parsing fails', () => {
		var goodResponse = { 'statusCode': 200};
		var nonsenseData = "88hwf489438hf89wh48f8w483";

		parseXMLresponse(undefined, goodResponse, nonsenseData, (d)=>{}, (h)=>{throw "Should not be called"},(e)=>{});
	});

	it('should log an error if the parsing fails', () => {
		var goodResponse = { 'statusCode': 200};
		var nonsenseData = "88hwf489438hf89wh48f8w483";

		var loggedError;
		parseXMLresponse(undefined, goodResponse, nonsenseData, (d)=>{}, (h)=>{},(e)=>{loggedError = e});

		expect(loggedError).to.include("Parsing failure: Error: Non-whitespace before first tag.");
	});

});