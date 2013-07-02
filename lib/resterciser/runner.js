'use strict';
/**
 * Loads specified test sequence, configures environment (reporters,
 * etc.) and kicks off the sequence execution.
 */

var Environment, EventEmitter, parsers, ParameterBag, Sequence;

Environment = require('./environment.js').Environment;
EventEmitter = require('events').EventEmitter;
ParameterBag = require('./parameter_bag').ParameterBag;
Sequence = require('./sequence').Sequence;

// @future: add more parsers + support plugging in  your own
parsers = [
	require('./sequence_parser/yaml')
];


function parseFile(file) {
	var match;
	parsers.some(function (parser) {
		if (parser.handles(file)) {
			match = parser;
			return true;
		}
	});

	if (!match) {
		throw new Error('Could not find parser for ' + file);
	}

	return match.parse(file);
}

/**
 * Builds env object (including event emitter) and allows
 * things like reporters to subscribe to events.
 */
function setupEnv(options) {
	var emitter, params, env;

	emitter = new EventEmitter();
	params = new ParameterBag(emitter);
	env = new Environment(emitter, params);

	// Set must-have options
	params.set('urlBase', options.urlBase);

	// Let all the reporters register themselves
	options.reporters.forEach(function (reporter) {
		reporter.bind(emitter);
	});

	env.emitter = emitter;
	return env;
}

exports.run = function run(rawSequence, options) {
	var env, parser, sequence;
	if (typeof rawSequence === 'string') {
		rawSequence = parseFile(rawSequence);
	}

	if (typeof rawSequence !== 'object') {
		throw new Error('Unhandled sequence type; must be path (string) or object');
	}

	env = setupEnv(options);

	sequence = new Sequence(rawSequence);
	sequence.run(env);
};
