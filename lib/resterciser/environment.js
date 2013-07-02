'use strict';

function Environment(emitter, params) {
	this.emitter = emitter;
	this.params = params;
}

/**
 * Convenience method
 */
Environment.prototype.get = function (key) {
	return this.params.get(key);
};

/**
 * @TODO: Write this
 */
Environment.prototype.replaceParams = function (input) {
	return input;
};

exports.Environment = Environment;
