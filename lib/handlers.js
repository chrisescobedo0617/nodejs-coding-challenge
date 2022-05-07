/*
 * Request Handlers
 *
 */

// Dependencies
const request_helpers = require('./request_helpers');
const helpers = require('./helpers');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

// Define all the handlers
const handlers = {};

// Not-Found
handlers.notFound = function (data, callback) {
  callback(404, {
    'message': 'endpoint doesnt exist'
  });
};

// Stations
handlers.stations = function (data, callback) {
  let acceptableMethods = ['get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._stations[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the stations methods
handlers._stations = {};

// stations - get
// Required data: station_id
handlers._stations.get = function (data, callback) {

  // Get token from headers
  let authorization = typeof (data.headers.authorization) == 'string' ? data.headers.authorization : false;
  // Check that station_id number is valid
  let station_id = typeof (data.queryStringObject.station_id) == 'string' && data.queryStringObject.station_id.trim().length >= 1 ? data.queryStringObject.station_id.trim() : false;

  if (authorization && station_id) {

    // Verify that the given token is valid
    handlers._tokens.verifyToken(authorization, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the stations
        request_helpers.getResponse(config.divvybikes_url, (err, response) => {
          if (!err && response) {
            // parse the response
            response = JSON.parse(response);
            let station = response.data.stations.filter(station => station.station_id == station_id);
            callback(200, { 'statusCode': 200, 'records': station });
          } else {
            callback(404, { 'statusCode': 404, 'error': err });
          }

        });
      } else {
        callback(403, { "Error": "Missing required token in header, or token is invalid." })
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
};

// Riders
handlers.riders = function (data, callback) {
  let acceptableMethods = ['get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._riders[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the riders methods
handlers._riders = {};

// riders - get
// Required data: stations,date
handlers._riders.get = function (data, callback) {
  // write your code here.
};

// riders - get
// Required data: stations,date
handlers._riders.getAgeGroups = function (stations, date, callback) {
  // write your code here.
}

// Trips
handlers.trips = function (data, callback) {
  let acceptableMethods = ['get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._trips[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the trips methods
handlers._trips = {};

// riders - get
// Required data: stations,date
handlers._trips.get = function (data, callback) {
  // write your code to get lat 20 trips.
};

// Tokens
handlers.tokens = function (data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - verification
// Verify if a given token id is currently valid for the given user
handlers._tokens.verifyToken = function (token, callback) {

  // Check that token is valid
  token = typeof (token) == 'string' && token.trim().length == 20 ? token.trim() : false;
  if (token) {
    // Lookup the token
    if (token == config.apikey) {
      callback(true, {});
    } else {
      callback(false, { 'statusCode': 404, 'Error': 'field invalid' });
    }
  } else {
    callback(false, { 'statusCode': 400, 'Error': 'Missing required field, or field invalid' });
  }
};

// Export the handlers
module.exports = handlers;
