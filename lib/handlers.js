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



//Function to check if the provided date is valid
const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
}

const inRange = (x, min, max) => {
  return ((x-min)*(x-max) <= 0);
}

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
  let stations =
    typeof data.queryStringObject.stations == "string" &&
    data.queryStringObject.stations.trim().length >= 1
      ? data.queryStringObject.stations.trim()
      : false;

  const rideDateBoolean = isValidDate(new Date(data.queryStringObject.date));
  //console.log(rideDateBoolean, stations)
  const rideDate = new Date(data.queryStringObject.date);

  if ((authorization && stations) && rideDateBoolean != false) {
    // Verify that the given token is valid

    let resultObject = {
      "0-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51+": 0,
      "unknown": 0
    }
    handlers._tokens.verifyToken(authorization, function (tokenIsValid) {
      if (tokenIsValid) {
        csv()
          .fromFile(divvyTrips2019)
          .then((jsonObj) => {
            for (let trip = 0; trip < jsonObj.length; trip++) {
              let elementStationId = jsonObj[trip]["02 - Rental End Station ID"];
              let elementRidersBirthYear = Number(jsonObj[trip]["05 - Member Details Member Birthday Year"]);
              let elementRideDate = (new Date(jsonObj[trip]["01 - Rental Details Local End Time"])).toDateString();
              //console.log(typeof elementRidersBirthYear);
              if ((stations.split(",").includes(elementStationId)) &&  rideDate.toDateString() == elementRideDate) {
                let ridersAge = 2022 - elementRidersBirthYear;
                console.log(ridersAge)
                if (inRange(ridersAge, 0, 20)) {
                  resultObject["0-20"] += 1;
                  console.log("IN RANGE")
                } else if (inRange(ridersAge, 21, 30)) {
                  resultObject["21-30"] += 1;
                  console.log("IN RANGE")
                } else if (inRange(ridersAge, 31, 40)) {
                  resultObject["31-40"] += 1;
                  console.log("IN RANGE")
                } else if (inRange(ridersAge, 41, 50)) {
                  resultObject["41-50"] += 1;
                  console.log("IN RANGE")
                } else if (ridersAge >= 51) {
                  resultObject["51+"] += 1;
                  console.log("IN RANGE")
                } else {
                  resultObject["unknown"] += 1;
                }
              }
            }
            //console.log(jsonObj)
            callback(200, { statusCode: 200, records: resultObject });
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

// riders - get
// Required data: stations,date
handlers._riders.getAgeGroups = function (stations, date, callback) {
  // write your code here.
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
        
  
  const rideDateBoolean = isValidDate(new Date(data.queryStringObject.date));
  const rideDate = new Date(data.queryStringObject.date);

  if ((authorization && stations) && rideDateBoolean != false) {
    // Verify that the given token is valid
    let resultObject = {}
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
                //Checking to see if the stationId does not exists as a key in the resultObject
                if ((elementStationId in resultObject) === false) {
                  //Add it as a key and set it to an empty array
                  resultObject[elementStationId] = []
                }
                resultObject[elementStationId].push(jsonObj[trip])
              }
            }
            callback(200, { statusCode: 200, records: resultObject });
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
