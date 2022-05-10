/*
 * Request Handlers
 *
 */

// Dependencies
const request_helpers = require("./request_helpers");
const helpers = require("./helpers");
const config = require("./config");
const fs = require("fs");
const path = require("path");
//const csv = require("fast-csv");
const csv = require("csvtojson");
const divvyTrips2019 =
  "/Users/bedo/Documents/projects/personal_projects/jr-dev-project/node-rest-api-challenge-master/lib/data/trips/Divvy_Trips_2019.csv";

// Define all the handlers
const handlers = {};

// Not-Found
handlers.notFound = function (data, callback) {
  callback(404, {
    message: "endpoint doesnt exist",
  });
};

// Stations
handlers.stations = function (data, callback) {
  let acceptableMethods = ["get"];
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
  let authorization =
    typeof data.headers.authorization == "string"
      ? data.headers.authorization
      : false;
  // Check that station_id number is valid
  let station_id =
    typeof data.queryStringObject.station_id == "string" &&
    data.queryStringObject.station_id.trim().length >= 1
      ? data.queryStringObject.station_id.trim()
      : false;

  if (authorization && station_id) {
    // Verify that the given token is valid
    handlers._tokens.verifyToken(authorization, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the stations
        request_helpers.getResponse(config.divvybikes_url, (err, response) => {
          if (!err && response) {
            // parse the response
            response = JSON.parse(response);
            let station = response.data.stations.filter(
              (station) => station.station_id == station_id
            );
            callback(200, { statusCode: 200, records: station });
          } else {
            callback(404, { statusCode: 404, error: err });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid.",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Riders
handlers.riders = function (data, callback) {
  let acceptableMethods = ["get"];
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
  let authorization =
    typeof data.headers.authorization == "string"
      ? data.headers.authorization
      : false;
  // Check that station_id number is valid
  let station_id =
    typeof data.queryStringObject.station_id == "string" &&
    data.queryStringObject.station_id.trim().length >= 1
      ? data.queryStringObject.station_id.trim()
      : false;

  if (authorization && station_id) {
    // Verify that the given token is valid
    handlers._tokens.verifyToken(authorization, function (tokenIsValid) {
      if (tokenIsValid) {
        csv()
          .fromFile(divvyTrips2019)
          .then((jsonObj) => {
            for (let trip = 0; trip < jsonObj.length; trip++) {
              let element = jsonObj[trip][11];
              console.log(trip);
            }
            //console.log(jsonObj)
            callback(200, { statusCode: 200, records: jsonObj });
          });
        //callback(200, { statusCode: 200, records: riderData });
        // Lookup the stations
        /*request_helpers.getResponse(config.divvybikes_url, (err, response) => {
          if (!err && response) {
            // parse the response
            response = JSON.parse(response);
            let station = response.data.stations.filter(
              (station) => station.station_id == station_id
            );
            callback(200, { statusCode: 200, records: station });
          } else {
            callback(404, { statusCode: 404, error: err });
          }
        });*/
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid.",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// riders - get
// Required data: stations,date
handlers._riders.getAgeGroups = function (stations, date, callback) {
  // write your code here.
  let authorization =
    typeof data.headers.authorization == "string"
      ? data.headers.authorization
      : false;
  // Check that station_id number is valid
  let station_id =
    typeof data.queryStringObject.station_id == "string" &&
    data.queryStringObject.station_id.trim().length >= 1
      ? data.queryStringObject.station_id.trim()
      : false;

  if (authorization && station_id) {
    // Verify that the given token is valid
    handlers._tokens.verifyToken(authorization, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the stations
        request_helpers.getResponse(
          readFile("Divvy_Trips_2019_Q2"),
          (err, response) => {
            if (!err && response) {
              // parse the response
              response = JSON.parse(response);
              let station = response.data.stations.filter(
                (station) => station.station_id == station_id
              );
              callback(200, { statusCode: 200, records: station });
            } else {
              callback(404, { statusCode: 404, error: err });
            }
          }
        );
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid.",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Trips
handlers.trips = function (data, callback) {
  let acceptableMethods = ["get"];
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
  let authorization =
    typeof data.headers.authorization == "string"
      ? data.headers.authorization
      : false;
  // Check that station_id number is valid
  let stations =
    typeof data.queryStringObject.stations == "string" &&
    data.queryStringObject.stations.trim().length >= 1
      ? data.queryStringObject.stations.trim()
      : false;
        

    //Function to check if the provided date is valid
    const isValidDate = (d) => {
      return d instanceof Date && !isNaN(d);
    }
  
  const rideDateBoolean = isValidDate(new Date(data.queryStringObject.date));
  const rideDate = new Date(data.queryStringObject.date);

  if ((authorization && stations) && rideDateBoolean != false) {
    // Verify that the given token is valid
    let stationResults = {};
    let testObject = {}
    handlers._tokens.verifyToken(authorization, function (tokenIsValid) {
      if (tokenIsValid) {
        csv()
          .fromFile(divvyTrips2019)
          .then((jsonObj) => {
            for (let trip = 0; trip < jsonObj.length; trip++) {
              let elementStationId = jsonObj[trip]["02 - Rental End Station ID"];
              let elementRideDate = (new Date(jsonObj[trip]["01 - Rental Details Local End Time"])).toDateString();
              if ((stations.split(",").includes(elementStationId)) &&  rideDate.toDateString() == elementRideDate) {
                console.log(jsonObj[trip]) 
                //Checking to see if the stationId does not exists as a key in the testObject
                if ((elementStationId in testObject) === false) {
                  //Add it as a key and set it to an empty array
                  testObject[elementStationId] = []
                }
                testObject[elementStationId].push(jsonObj[trip])
              }
            }
            callback(200, { statusCode: 200, records: testObject });
          });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid.",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Tokens
handlers.tokens = function (data, callback) {
  let acceptableMethods = ["post", "get", "put", "delete"];
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
  token =
    typeof token == "string" && token.trim().length == 20
      ? token.trim()
      : false;
  if (token) {
    // Lookup the token
    if (token == config.apikey) {
      callback(true, {});
    } else {
      callback(false, { statusCode: 404, Error: "field invalid" });
    }
  } else {
    callback(false, {
      statusCode: 400,
      Error: "Missing required field, or field invalid",
    });
  }
};

// Export the handlers
module.exports = handlers;
