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

		self.env.emitter.emit('httpResponse', prettyResponse);
		self.response = prettyResponse;
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

Request.prototype.run = function () {
	var httpOptions, self = this;

	httpOptions = this.makeHttpOptions();
	this.env.emitter.emit('httpRequest', httpOptions, this);

	return request(httpOptions).then(function (response) {
		return self.checkResponse(response);
	});
};

exports.Request = Request;
