/**
 * Container for parameters that are used through
 * a test series. Allows setting non-overwriteable
 * parameters and makes it easy to report when
 * parameters are added/updated
 */
'use strict';

function ParameterBag(e) {
	this.emitter = e;
	this._data = {};
	this._locked = {};
}

ParameterBag.prototype.get = function (key) {
	var value;
	return this._data[key];
};

ParameterBag.prototype.set = function (key, value) {
	if (this._locked[key]) {
		throw new Error("Cannot set locked parameter " + key);
	}

	this._data[key] = value;
	this.emitter.emit('parameterChange', key, value);
};

ParameterBag.prototype.lock = function (key) {
	this.locked[key] = true;
};

exports.ParameterBag = ParameterBag;
