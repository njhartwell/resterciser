'use strict';

function Environment(emitter, params) {
	this.emitter = emitter;
	this.params = params;
	this.processors = {
		before: {},
		after: {}
	};
}

/**
 * Convenience method
 */
Environment.prototype.get = function (key) {
	return this.params.get(key);
};

Environment.prototype.registerProcessor = function registerProcessor(processor) {
	if (this.processors[processor.type] === undefined) {
		throw new Error('Unknown processor type ' + processor.type);
	}

	if (!processor.name) {
		throw new Error('Processor must have a name');
	}

	if (typeof processor.process !== 'function') {
		throw new Error('Processor.process must be a function');
	}

	this.processors[processor.type][processor.name] = processor.process;
};

/**
 * Replaces parameter references (%foo%) in input with values stored
 * in this.params.
 *
 * @TODO: Make it work
 */
Environment.prototype.replaceParams = function (input) {
	var self = this;

	if (typeof input === 'array') {
		return input.map(this.replaceParams, this);
	}

	if (typeof input === 'object') {
		Object.keys(input).forEach(function (key) {
			input[key] = self.replaceParams(input[key]);
		});

		return input;
	}

	if (typeof input !== 'string') {
		throw new Error('Can only replace params on string/object/array');
	}

	return input.replace(/%([\w.\d]+)%/g, function (m, parameter) {
		return self.get(parameter);
	});
};

exports.Environment = Environment;
