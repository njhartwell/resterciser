'use strict';

var request = require('promised-io/http-client').request;

function Request(def, env) {
	this.def = def;
	this.env = env;
}

Request.prototype.checkResponse = function (response) {
	var self = this;

	return response.body.join('').then(function (body) {
		var prettyResponse = {
			status: response.status,
			headers: response.headers,
			body: body
		};

		self.env.emitter.emit('httpResponse', prettyResponse, self);
		self.response = prettyResponse;
		self.callProcessors('after', [response, self.env]);
	}).then(function () {
		var expected;
		expected = self.def.expect;
		if (!expected) {
			expected = 200;
		}

		if (self.response.status !== expected) {
			self.env.emitter.emit('testFail');
			throw new Error('Unexpected response code');
		}
	});
};

Request.prototype.makeHeaders = function () {
	var headers, self;
	self = this;

	if (this.env.defaultHeaders) {
		headers = this.env.defaultHeaders;
	} else {
		headers = {};
	}

	if (this.def.headers) {
		Object.keys(this.def.headers).forEach(function (key) {
			headers[key] = self.def.headers[key];
		});
	}

	return this.env.replaceParams(headers);
};

Request.prototype.makeHttpOptions = function () {
	var chunks, url, out;

	chunks = this.def.request.split(' ');
	url = this.makeUrl(chunks[1]);

	out = {
		headers: this.makeHeaders(),
		method: chunks[0],
		url: url
	};

	if (this.def.body) {
		out.body = [this.env.replaceParams(this.def.body)];
	}

	return out;
};

Request.prototype.makeUrl = function (path) {
	var raw;
	raw = this.env.get('urlBase') + path;
	return this.env.replaceParams(raw);
};

Request.prototype.callProcessors = function (type, args) {
	var self = this;

	if (!this.def[type]) {
		return;
	}

	this.def[type].forEach(function (processorDef) {
		// The processor def is an object with one key, which is the name
		// of the processor.
		var processorName = Object.keys(processorDef)[0];

		if (undefined === self.env.processors[type][processorName]) {
			throw new Error('Could not find processor for ' + processorName);
		}

		// Add arguments in the processor's definition its call
		args.unshift(processorDef[processorName]);
		self.env.processors[type][processorName].apply(null, args);
	});
};

Request.prototype.run = function () {
	var httpOptions, self = this;

	httpOptions = this.makeHttpOptions();
	this.env.emitter.emit('httpRequest', httpOptions, this);
	this.callProcessors('before', [httpOptions, this.env]);
	return request(httpOptions).then(function (response) {
		return self.checkResponse(response);
	});
};

exports.Request = Request;
