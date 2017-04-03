"use strict"

const express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	path = require("path"),
	http = require("http"),
	cors = require("cors");

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(path.join(__dirname + "/../static")));

app.set('view engine', 'pug');
app.listen(3000, () => {
	console.log("running server on port " + 3000);
	console.log("access content using URL: http://127.0.0.1:3000/");
});

/**
 * function to append an extra 0 if value is less then length
 * @param value {number}
 * @param length {number}
 * @return {String}
 */
var appendZeroIfLessThanTen = function(value, length) {

	var newValue = value + "";
	while (newValue.length < length) {
		newValue = "0" + newValue;
	}

	return newValue;
}

/** 
 * function to get date timestamp in format yyyyMMddHHmmss
 * @return {String}
 */
var getDateTimeStamp = function() {
	var dt = new Date();
	return appendZeroIfLessThanTen(dt.getFullYear(), 4)+ 
		appendZeroIfLessThanTen((dt.getMonth() + 1), 2) + 
		appendZeroIfLessThanTen(dt.getDate(), 2) + 
		appendZeroIfLessThanTen(dt.getHours(), 2) + 
		appendZeroIfLessThanTen(dt.getMinutes(), 2) + 
		appendZeroIfLessThanTen(dt.getSeconds(), 2) + 
		appendZeroIfLessThanTen(dt.getMilliseconds(), 3);
};

/**
 * function to process the URL to remove __ and ___
 * @param url {String}
 * @return {String}
 */
var processURL = function(url) {

	while (url.indexOf("___") !== -1) {
		url = url.replace("___", "&");
	}

	while (url.indexOf("__") !== -1) {
		url = url.replace("__", "?");
	}

	console.log(getDateTimeStamp() + "---------- URL: " + url + " ----------");

	return url;
};

/**
 * function to process response data
 * @param res {Object}
 * @param response {Object} Http Response
 */
var processHttpResponse = function(res, response) {
	const statusCode = res.statusCode;
	const contentType = res.headers['content-type'];

	let error;
	if (statusCode !== 200) {
		error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`);
	}

	if (error) {
		console.log(error.message);
		res.resume();

		response.send({error: true});
	}

	res.setEncoding('utf8');
	let rawData = '';
	res.on('data', (chunk) => rawData += chunk);
	res.on('end', () => {
		response.send({content: rawData});
	});
};

app.route("/get")
	.get((request, response) => {

		let url = processURL(request.query.url);
		http.get(url, function(res) {
			processHttpResponse(res, response);
		});
	});

