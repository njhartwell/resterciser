'use strict';
var promiseLib, Request;
Request = require('./request').Request;
promiseLib = require('promised-io/promise');

function Sequence(def) {
	this.def = def;
	this._queue = [];
}

Sequence.prototype.createRequest = function (def) {
	var request;

	// Concurrent requests are represented as an array of objects
	if (Array.isArray(def)) {
		return def.map(this.createRequest, this);
	}

	return new Request(def, this.env);
};

Sequence.prototype.emit = function () {
	this.env.emitter.emit.apply(this.env.emitter, arguments);
};

Sequence.prototype.run = function (env) {
	var self = this;
	this.env = env;

	this.emit('sequenceStart', this);

	this.def.sequence.forEach(function (requestDef) {
		self._queue.push(self.createRequest(requestDef));
	});

	return this.processQueue();
};

Sequence.prototype.processQueue = function () {
	var cluster, promise, req, self;
	self = this;
	req = this._queue.shift();

	if (!req) {
		this.emit('sequenceEnd');
		return null;
	}

	if (Array.isArray(req)) {
		// Get an array of promises from the array of Requests
		cluster = req.map(function (request) {
			return request.run();
		});
		promise = promiseLib.all(cluster);
	} else {
		promise = req.run();
	}

	return promise.then(function () {
		// If another request is being processed, this will return
		// a promise, otherwise null
		return self.processQueue();
	});
};

exports.Sequence = Sequence;
