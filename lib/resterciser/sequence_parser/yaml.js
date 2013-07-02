'use strict';

var yaml = require('js-yaml');
var fs = require('fs');

exports.handles = function isYaml(file) {
	return (/\.ya?ml/).test(file);
};

exports.parse = function parseYaml(file) {
	var path;

	/*jslint stupid:true*/
	path = fs.realpathSync(file);
	/*jslint stupid:false*/

	if (!path) {
		throw new Error('Invalid path ' + file);
	}
	return require(path);
};
