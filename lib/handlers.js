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
//Folder to pull the data for the riders and trips endpoints
const divvyTrips2019 =
  "lib/data/trips/Divvy_Trips_2019.csv";



//Function to check if the provided date is valid
const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
}

//Function to return boolean depending if the prodived number is between a provided range
const between = (x, min, max) => {
  return x >= min && x <= max;
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
  const rideDate = new Date(data.queryStringObject.date);

  if ((authorization && stations) && rideDateBoolean != false) {

    //Object to hold and push the results to
    let resultObject = {
      "0-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51+": 0,
      "unknown": 0
    }
    handlers._tokens.verifyToken(authorization, function (tokenIsValid) {
      // Verify that the given token is valid
      if (tokenIsValid) {
        //If the auth token is vailid convert the csv to json
        csv()
          .fromFile(divvyTrips2019)
          .then((jsonObj) => {
            for (let trip = 0; trip < jsonObj.length; trip++) {
              let elementStationId = jsonObj[trip]["02 - Rental End Station ID"];
              let elementRidersBirthYear = Number(jsonObj[trip]["05 - Member Details Member Birthday Year"]);
              let elementRideDate = (new Date(jsonObj[trip]["01 - Rental Details Local End Time"])).toDateString();
              if ((stations.split(",").includes(elementStationId)) &&  rideDate.toDateString() == elementRideDate) {
                //Assumed that we are calculating their age based off the year the trip was taken.
                let ridersAge = 2019 - elementRidersBirthYear;
                if (between(ridersAge, 0, 20)) {
                  resultObject["0-20"] += 1;
                } else if (between(ridersAge, 21, 30)) {
                  resultObject["21-30"] += 1;
                } else if (between(ridersAge, 31, 40)) {
                  resultObject["31-40"] += 1;
                } else if (between(ridersAge, 41, 50)) {
                  resultObject["41-50"] += 1;
                } else if ((ridersAge >= 51) && (elementRidersBirthYear != '')) {
                  resultObject["51+"] += 1;
                } else if (elementRidersBirthYear == '') {
                  resultObject["unknown"] += 1;
                }
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
                //Checking to see if the stationId does not exists as a key in the resultObject
                if ((elementStationId in resultObject) === false) {
                  //Add it as a key and set it to an empty array
                  resultObject[elementStationId] = []
                }
                resultObject[elementStationId].push(jsonObj[trip])
              }
            }
            //Looping through every array in the results to check if it has more than 20 elements
            for (let i in resultObject) {
              if (resultObject[i].length > 20) {
                //Set the array to only have the last 20 trips
                resultObject[i] = resultObject[i].slice(-20)
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
