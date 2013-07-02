'use strict';

var fs, yaml;
yaml = require("js-yaml");
fs = require('fs');

function parseResponseDef(responseDef) {
	if (!responseDef.path) {
		throw new Error('Invalid response definition; it must contain path');
	}

	responseDef.path = new RegExp(responseDef.path);

	if (responseDef.method) {
		responseDef.method = new RegExp(responseDef.method);
	} else {
		responseDef.method = /^/;
	}
}

exports.load = function load(configPath) {
	var config;
	if (!/\.ya?ml/.test(configPath)) {
		throw new Error('Config file must have a .yml or .yaml extension');
	}

	// Crockford, you old goose
	/*jslint stupid: true*/
	config = yaml.load(fs.readFileSync(configPath).toString());
	/*jslint stupid: false*/

	if (config.stateless) {
		config.stateless.forEach(parseResponseDef);
	} else {
		config.stateless = [];
	}

	if (config.stateful) {
		Object.keys(config.stateful).forEach(function (key) {
			config.stateful[key].forEach(parseResponseDef);
		});
	} else {
		config.stateful = {};
	}

	return config;
};
