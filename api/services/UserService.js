// api/services/UsersService.js

module.exports = {

  doGetAllUsers: function(callback) {

    var userQuery = User.find();
    var sortString = 'name ASC';

    userQuery.sort(sortString);
    userQuery.exec(function(err, users) {
      if (err) {
        return res.serverError(err);
      }

      var json = {};
      if (typeof options == 'object') {
        json = options;
        options.users = users;
      } else {
        json.users = users;
      }
      callback("", json);

    });

  },

  doAddUser: function(name, callback) {

    User.findOne({
      name: name
    }).exec(function(err, useri) {
      if (typeof useri !== 'undefined') {
        callback('', '');
      } else {
        User.create({
          name: name,
          points: 0
        }).exec(function createCB(err, created) {

          User.find(function(err, users) {
            if (err) {
              return res.serverError(err);
            }
            callback('', '');

          });
        });
      }
    });
  },


  updateUserPoints: function(name, points, callback) {

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
          callback(null, "k");
        });
      });

    });


  }

};
