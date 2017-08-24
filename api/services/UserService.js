var Promise = require('bluebird');
// api/services/UsersService.js

module.exports = {

    doGetAllUsers: function(callback) {

      console.log('Getting all users');

      User.find(function(err, users) {
        if (err) {
          return res.serverError(err);
        }

        var json = {};
        if (typeof options=='object') {
          json = options;
          options.users=users;
        } else {
          json.users=users;
        }
        callback("",json);

      });

    },


    updateUserPoints: function(name, points,callback) {

      var curPoints = 0;

      User.findOne({
        name: name
      }).exec(function(err, useri) {
        console.log('name:' + useri.name);
        if (typeof useri.points !== 'undefined') {
          curPoints = useri.points;
        }
        User.update({
          name: name
        }, {
          points: parseInt(points) + curPoints
        }).exec(function(err, data) {

          User.find(function(err, users) {
            if (err) {
              callback(res.serverError(err), "err");
            }
            callback(null,"k");
          });
        });

      });


}

    };
