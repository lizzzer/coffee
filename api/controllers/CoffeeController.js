var moment = require('moment');

/**
 * CoffeeController
 *
 * @description :: Server-side logic for managing coffees
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  doPageLogin: function(req, res) {

    var params = req.params.all();

    res.cookie('userName', params.name, {
      maxAge: 900000,
      httpOnly: true
    });

    return res.redirect('http://'+sails.config.c_hostname+':'+sails.config.port);

  },

  doPage: function(req, res, options) {

    var userName = req.cookies.userName;
    var json = {};

    UserService.doGetAllUsers(function(err, resp) {
      json = resp;

      if (typeof options == 'object') {
        json.options = options;
      }

      if (userName == undefined) {
        return res.view('loginpage', json);
      }

      MachineService.doGetMachineHistory(function(err, hist) {

        json.history = hist;
        json.moment = moment;
        return res.view('homepage', json);
      });

    });
  },

  /**
   * `CoffeeController.notify()`
   */
  notify: function(req, res) {

    var userName = req.cookies.userName;
    var coffee_config = sails.config.custom.coffee_config;

    if (userName == undefined) {
      return res.view('loginpage');
    }

    NotifyService.sendNotify({}, function(err) {
      if (err) {
        return res.serverError(err);
      }

      return res.ok();
    });

    UserService.updateUserPoints(userName, coffee_config.points, function(err, data) {

      var options = {
        points: coffee_config.points,
        showModal: 1,
        message: coffee_config.message
      };

      sails.controllers.coffee.doPage(req, res, options);

    });
  },

  doShowMachineMaintenance: function(req, res) {

    var params = req.params.all();

    UserService.doGetAllUsers(function(err, resp) {

      json = resp;

      if (typeof options == 'object') {
        json.options = options;
      }

      MachineService.doGetMachineHistory(function(err, hist) {

        json.history = hist;

        MachineService.doGetMachineDetailedHistory(params.machine_id, function(err, hist_detail) {

          json.history_detail = hist_detail;
          json.moment = moment;

          return res.view('logpage', json);
        });

      });

    });

  },

  doMachineMaintenance: function(req, res) {

    var userName = req.cookies.userName;
    var params = req.params.all();
    var maintenance_id = params.maintenance_id;
    var maintenance_config = sails.config.custom[maintenance_id];

    if (userName == undefined || maintenance_config == undefined) {
      return res.view('loginpage');
    }

    MachineService.doAddRow(maintenance_config, userName, function(err, data) {

      if (err) {
        console.log("error happened");

        var options = {
          points: 0,
          showModal: 1,
          message: 'Vähän turhan innokasta. ' + err
        };

        sails.controllers.coffee.doPage(req, res, options);

      } else {

        UserService.updateUserPoints(userName, maintenance_config.points, function(err, data) {

          var options = {
            points: maintenance_config.points,
            showModal: 1,
            message: maintenance_config.message
          };

          sails.controllers.coffee.doPage(req, res, options);

        });
      }
    });

  },

	doDeleteMachineById: function(req, res) {

		var params = req.params.all();

		Machine.destroy({
      machine_id: params.machine_id
    }).exec(function(err) {
      if (err) {
        return res.negotiate(err);
      }
      sails.log(params.machine_id + ' Now destroyed');
      return res.ok();
    });

	},

  doDeleteUser: function(req, res) {

    var params = req.params.all();

    User.destroy({
      name: params.name
    }).exec(function(err) {
      if (err) {
        return res.negotiate(err);
      }
      sails.log(params.name + ' Now destroyed');
      return res.ok();
    });

  },

  doUpdateUser: function(req, res) {

    var params = req.params.all();
    var curPoints = 0;

    User.findOne({
      name: params.name
    }).exec(function(err, useri) {
      console.log('nykyinenuseri:' + useri);
      if (typeof useri.points !== 'undefined') {
        curPoints = useri.points;
      }

      User.update({
        name: params.name
      }, {
        points: parseInt(params.points) + curPoints
      }).exec(function(err, data) {

        User.find(function(err, users) {
          if (err) {
            return res.serverError(err);
          }
          return res.view('homepage', {
            users: users

          });
        });

      });
    });

  },

  doAddUser: function(req, res) {

    var params = req.params.all();

    User.create({
      name: params.name,
      points: 0
    }).exec(function createCB(err, created) {

      User.find(function(err, users) {
        if (err) {
          return res.serverError(err);
        }

        sails.controllers.coffee.doPage(req, res);

      });

    });


  }

};
