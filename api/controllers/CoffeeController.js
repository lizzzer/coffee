var moment = require('moment-timezone');

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
      maxAge: new Date(Date.now() + 3600000),
      httpOnly: true
    });

    return res.redirect('http://' + sails.config.c_hostname + sails.config.c_port);

  },

  doPage: function(req, res, options) {

    var userName = req.cookies.userName;
    var json = {};
    var tasks = {};
    var config = sails.config.custom;

    UserService.doGetAllUsers(function(err, resp) {
      json = resp;

      if (typeof options == 'object') {
        json.options = options;
      }

      if (userName == undefined) {
        return res.view('loginpage', json);
      }

      for (task in config) {
        if (config[task].section != undefined) {
          if (tasks[config[task].section] == undefined) {
            tasks[config[task].section] = [];
            tasks[config[task].section].push(config[task]);
          } else {
            tasks[config[task].section].push(config[task]);
          }
        }
      }

      MachineService.doGetMachineHistory(function(err, hist) {
        json.history = hist;
        json.moment = moment;
        json.tasks = tasks;
        return res.view('homepage', json);
      });

    });
  },

  doGetPointsAndActivities: function(req, res) {

    if (!req.isSocket) {
      return res.badRequest();
    }

    UserService.doGetAllUsers(function(err, resp) {
      json = resp;

      MachineService.doGetMachineHistory(function(err, hist) {
        json.history = hist;
        json.moment = moment;
        return res.json(json);
      });

    });


  },

  /**
   * `CoffeeController.notify()`
   */
  notify: function(req, res) {

    var params = req.params.all();
    var userName = req.cookies.userName;
    var notify_id = params.notify_id;
    var notify_config = sails.config.custom[notify_id];
    var notify_cookie = req.cookies.notifyId;

    if (userName == undefined) {
      return res.view('loginpage');
    }

    if (notify_config == undefined || notify_cookie == notify_id) {
      return res.redirect('http://' + sails.config.c_hostname + sails.config.c_port);
    } else {

      var options = {
        points: notify_config.points,
        showModal: 1,
        message: notify_config.message
      };

      NotifyService.sendNotifyToSlack(userName + ": " + notify_config.messageToEndPoint, function(err) {
        if (err) {
          sails.log(err);
        }
        if (notify_config.points > 0) {
          UserService.updateUserPoints(userName, notify_config.points, function(err, data) {
            sails.log('updated user points');
          });
        }

        res.cookie('notifyId', notify_id, {
          expires: new Date(Date.now() + 36000),
          httpOnly: true
        });
        sails.controllers.coffee.doPage(req, res, options);

      });

    }

  },

  eventNotify: function(req, res) {

    var params = req.params.all();
    var userName = req.cookies.userName;
    var notify_id = params.notifyId;
    var notify_config = sails.config.custom[notify_id];
    var notify_cookie = req.cookies.notifyId;

    if (userName == undefined) {
      return res.view('loginpage');
    }

    if (notify_config == undefined || notify_cookie == notify_id) {
      return res.json({
        triggerRedirect: true
      });
    } else {

      var options = {
        points: notify_config.points,
        showModal: 1,
        message: notify_config.message
      };

      NotifyService.sendNotifyToSlack(userName + ": " + notify_config.messageToEndPoint, function(err) {
        if (err) {
          sails.log(err);
        }
        if (notify_config.points > 0) {
          UserService.updateUserPoints(userName, notify_config.points, function(err, data) {
            sails.log('updated user points');
          });
        }

        sails.sockets.broadcast('mainSockets', 'eventCompleted', {
          message: userName + notify_config.messageToBroadcast
        }, req);

        return res.json(options);

      });

    }

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

  doShowMachineMaintenanceAsJSON: function(req, res) {

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

          return res.json(json.history_detail);
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
      sails.controllers.coffee.doPage(req, res);
    } else {

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
    }

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

    UserService.doAddUser(params.name, function(err, data) {
      sails.controllers.coffee.doPageLogin(req, res);
    });

  },

  event: function(req, res) {

    if (!req.isSocket) {
      return res.badRequest();
    }

    var userName = req.cookies.userName;
    var maintenance_id = req.param('maintId');
    var maintenance_config = sails.config.custom[maintenance_id];

    if (userName == undefined || maintenance_config == undefined) {
      sails.controllers.coffee.doPage(req, res);
    } else {

      MachineService.doAddRow(maintenance_config, userName, function(err, data) {

        if (err) {
          console.log("error happened");
          var options = {
            points: 0,
            showModal: 1,
            message: 'Vähän turhan innokasta. ' + err
          };

          return res.json(options);

        } else {
          UserService.updateUserPoints(userName, maintenance_config.points, function(err, data) {
            var options = {
              points: maintenance_config.points,
              showModal: 1,
              message: maintenance_config.message
            };
            sails.sockets.broadcast('mainSockets', 'eventCompleted', {
              message: userName + " " + maintenance_config.messageToBroadcast
            }, req);
            return res.json(options);
          });
        }
      });
    }

  },

  joinRoom: function(req, res) {

    if (!req.isSocket) {
      return res.badRequest();
    }

    var params = req.params.all();
    var userName = req.cookies.userName;
    var noBroadcast = req.cookies.noBroadcast;

    sails.sockets.join(req, 'mainSockets');

    if (noBroadcast == undefined) {
      sails.sockets.broadcast('mainSockets', 'roomLog', {
        message: userName + " joined the party"
      }, req);
    }

    return res.json({
      message: 'joined'
    });

  }


};
