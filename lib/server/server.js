(function () {
	"use strict";
	var appState, argv, config, http;


	argv = require("optimist")
		.usage("Usage: $0 -p [port] [config.yaml]")
		.demand(["p"])
		.argv;

	http = require("http");

	config = require('./config_parser').load(argv._[0]);

	appState = config.initialState;
	if (appState) {
		console.log("Initial state set to " + appState);
	}

	/**
	 * Check path then method
	 *
	 * @return boolean
	 */
	function responseMatches(request, responseDef) {
		if (!responseDef.path.test(request.url)) {
			return false;
		}

		return responseDef.method.test(request.method);
	}

	/**
	 * Looks for a match available in current application state
	 * and changes state if matched response says to
	 *
	 * @param http.IncomingMessage request
	 * @return object|null
	 */
	function findStatefulResponse(request) {
		var found;
		if (!appState) {
			return;
		}

		config.stateful[appState].some(function (responseDef) {
			if (responseMatches(request, responseDef)) {
				found = responseDef;
				return true;
			}
		});

		if (found && found.changeState) {
			appState = found.changeState;
			console.log('Changed state to ' + appState);
		}

		return found;
	}

	/**
	 * Look for stateful response first and change state if directed,
	 * then fallback to stateless responses
	 *
	 * @param http.IncomingMessage request
	 * @return object|null
	 */
	function findResponse(request) {
		var found = null;
		found = findStatefulResponse(request);
		if (found) {
			return found;
		}

		config.stateless.some(function (resp) {
			if (responseMatches(request, resp)) {
				found = resp;
				return true;
			}
		});

		return found;
	}

	function listener(httpRequest, httpResponse) {
		var response, contentLength, headers, statusCode;

		response = findResponse(httpRequest);

		if (!response) {
			httpResponse.writeHead(404, 'Mock response not found');
			httpResponse.end();
			return;
		}

		if (response.code) {
			statusCode = response.code;
		} else {
			statusCode = 200;
		}

		if (response.headers) {
			headers = response.headers;
		} else {
			headers = {};
		}

		if (!response.body) {
			response.body = "";
		}

		contentLength = Buffer.byteLength(response.body, "utf8");
		headers["Content-Length"] = contentLength;
		httpResponse.writeHead(statusCode, headers);
		httpResponse.end(response.body);
	}

	http.createServer(listener).listen(argv.p);
}());
