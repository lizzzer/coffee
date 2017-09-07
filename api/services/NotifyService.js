var request = require('request');

// api/servicesNotifyService.js

module.exports = {

  sendNotify: function(options, done) {

    var options = {
      uri: sails.config.notify_uri,
      method: 'POST',
      json: {
        "text": "Kahvia tulossa :)"
      }
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body.id) // Print the shortened url.
      } else {
        console.log(response);
      }
    });

  },

  sendRichNotifyToSlack: function(text, callback) {

    var options = {
      uri: sails.config.notify_uri,
      method: 'POST',
      json: text
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(error);
      } else {
        callback(error);
      }
    });

  },

  sendNotifyToSlack: function(text, callback) {

    var options = {
      uri: sails.config.notify_uri,
      method: 'POST',
      json: {
        "text": text
      }
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(error);
      } else {
        callback(error);
      }
    });

  }

};
