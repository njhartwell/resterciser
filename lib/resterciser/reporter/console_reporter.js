'use strict';

/**
 * A boring (but useful) plaintext reporter
 */

exports.bind = function (e) {
	e.on('parameterChange', function (key, value) {
		console.log('Parameter ' + key + ' set to ' + value);
	});

	e.on('sequenceStart', function () {
		console.log('Starting test sequence');
	});

	e.on('sequenceFinish', function () {
		console.log('Test sequence finished');
	});

	e.on('httpRequest', function (request) {
		console.log('REQUEST', request);
	});

	e.on('httpResponse', function (response) {
		console.log('RESPONSE', response);
	});

	e.on('testFail', function () {
		console.log('FAIL');
	});

	e.on('testPass', function () {
		console.log('PASS');
	});
};
