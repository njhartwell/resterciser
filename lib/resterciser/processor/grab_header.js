'use strict';

/**
 * An inspector that gets a header from the response and
 * sets it as a parameter.
 */
function grabHeader(args, response, env) {
    var toGrab, headerValue;

    if (!args.header) {
        throw new Error('Missing header argument for grabHeader inspector');
    }

    if (!args.parameter) {
        throw new Error('Missing parameter argument for grabHeader inspector');
    }

    toGrab = args.header.toLowerCase();

    headerValue = response.headers[toGrab];
    env.params.set(args.parameter, headerValue);
}

exports.type = "after";
exports.name = "grabHeader";
exports.process = grabHeader;
