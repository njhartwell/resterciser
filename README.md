# RESTerciser #

REST API Testing Framework that uses declarative YAML files to specify
a sequence of requests and response expectations.

Warning: This is a very early preview--it is missing important things like:

- Adequate documentation and testing
- Grabbing parameters from responses to re-use later
- Being able to "expect" more than just a matching status code
- Testing in node < 0.10
- Pretty reporting (you know, ".............FFFFFFF........")

## Key features ##

- Simple, easy, fun to use
- Easily specify concurrent or sequential requests
- Extensible (emits events to allow plugging in new reporters, response inspectors,
  request pre-processors, etc.)

## Installation ##

Basic:

    git clone https://github.com/njhartwell/resterciser
    cd resterciser
    npm install

If you want to contribute, hack, and do other cool things:

    git clone https://github.com/njhartwell/resterciser
    cd resterciser
    ./util/bin/setup_repository

setup_repository?

This is part of the excellent https://github.com/fidian/bare_repo project which automagically sets up hooks
and other useful things to eleminate boilerplate repository configuration.

## Usage ##

First, you need to write a test sequence. A test sequence is simply a yaml file
with a list of one or more requests. It looks like this:

```yaml
sequence:       
    - request: GET /about                                               
      expect: 200                                                       
    - request: GET /carts/123                                           
      expect: 404
```

You can do more fancy things, but we'll start simple.

Assuming the API you're about to hit is up and running on localhost:8090
and you've saved your test sequence at ~/hello_resterciser.yaml, you can start
the workout:

*Helpful hint: You can use the included mock server to provide the API used in this example. Jump down to the Mock-A-Rest section below for details*

    ./bin/resterciser --url-base http://localhost:8090 ~/hello_resterciser.yaml

You will see an ugly, verbose play-by-play of what's happening, and if some expectation
is not met, you'll see an even more ugly error and stack trace (I warned you)

See example/test_sequence.yaml for more examples.

## Future ##

In addition to the core improvements mentioned above, the following items are high the list:

- Provide a bridge / driver to generate test suites for a popular testing framework (probably Mocha)
This would provide a nice suite of reporting tools and make it easier for newcomers to pull this kind
of testing into existing projects.
- Add a better suite of tests to existing code
- Add request descriptions
- Support alternate test sequence formats
- Add pretty request/response dumping and archiving
- Add documentation generation

# Mock-A-Rest #

A simple server for mocking REST services.

Mock-a-rest reads a YAML configuration file and serves up something that *looks* like a real REST API.
It's useful for coding against an API that is flaky, does not yet exist, or doesn't like to be hit
1000 times/second by your unit tests

## Configuration file ##

The configuration file looks like this (taken from examples/server_config.yaml):

```yaml

stateless:
    - path: ^/about$  # A javascript RegExp pattern
      method: GET     # Optional request method to filter on
      headers:        # Response headers
        Content-type: text/plain
      body: "This is fake API"  # Response body

stateful:
    noCart:
        - path: ^/carts$
          method: POST
          code: 201
          headers:
            Location: /carts/123
            Content-Type: application/json
          changeState: oneCart
    oneCart:
        - path: ^/carts/123$
          method: GET
          headers:
            Content-type: application/json

initialState: noCart
```

### Route lists ###

The sever looks at the request method + url path and, if a match is found, delivers
the specified status code, headers, and response body (if present). As seen in the
above example, the path element is a javascript RegExp and the method is a string.
The text block notation in YAML lends itself well to sticking large, unescaped JSON or XML
responses in your configuration files.


### Stateful and Stateless ###

To spice things up (and make it look more like a real API), mock-a-rest supports both
stateful and stateless route lists. The stateless part, as its name suggests, does not
care what requests you've made before--these routes are always available. If you
need to deliver the same canned responses over and over, you can just have a list of
stateless routes and skip the rest.

The stateful section contains a map of "states" and each state has a list of routes
that are available while in that state. Any route in one of these lists may contain
a "changeStae" key that makes the server change to that state. This allows fairly complex
flows to be represented without having to write any real code. In the example above,
the server is started at the "noCart" state (per the initialState parameter). A POST
to /carts will kick it into the "oneCart" state. At this point, making another
POST to /carts will return a 404!

**Note well: stateful routes take priority over stateless ones.**


## Usage ##

First, write (or borrow) a configuation file. Look at example/server_config.yaml for inspiration.
Next, start the server:

    ./bin/mock-server -p 8090 ./example/server_config.yaml

Finally, make the server do something. If you're an old neckbeard (or want to be), use curl:

    curl -v http://localhost:8090/about
    curl -v http://localhost:8090/carts -X 'POST'
    curl -v http://localhost:8090/carts/123
    curl -v http://localhost:8090/carts/123 -X 'DELETE'

Otherwise, fire up the sample resterciser test sequence mentioned above:

    ./bin/resterciser --url-base http://localhost:8090 ./example/test_sequence.yaml
