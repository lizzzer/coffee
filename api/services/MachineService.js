// api/services/MachineService.js

module.exports = {

  _createRow: function(maintenance_config, user) {
    Machine.create({
      machine_id: maintenance_config.machine_id,
      action: maintenance_config.action_id,
      history_message: maintenance_config.history_message,
      user: user
    }).exec(function(err, machine) {
      if (err) {
        return res.serverError(err);
      }
      sails.log('machine\'s id is:', machine.id);
      sails.log(machine);
    });
  },

  doAddRow: function(maintenance_config, user, callback) {
    if (maintenance_config.timeout > 0) {
      MachineService.doGetLastMachineByMachineIdUserNameActionId(user, maintenance_config.machine_id, maintenance_config.action_id, function(err, date) {

        var diff = 0;
        if (date != undefined) {
          diff = Math.abs(new Date().getTime() - date.createdAt.getTime()) / 3600000;
        }

        if (maintenance_config.timeout - diff <= 0 || date == undefined) {
          MachineService._createRow(maintenance_config, user);
          callback("", "jei");
        } else {
          var diff = (maintenance_config.timeout - diff).toFixed(2);
          var message = 'Odottelehan vielä ' + diff + ' tuntia';
          console.log(message);
          callback(message, "nah");
        }
      });

    } else {
      MachineService._createRow(id, action, user);
      callback("", "jei");
    }
  },

  doGetMachineHistory: function(callback) {
    Machine.find({
      limit: 10,
      sort: 'createdAt DESC'
    }).exec(function(err, result) {
      callback("", result);
    });
  },

  doGetMachineDetailedHistory: function(machine_id, callback) {
    Machine.find({
      where: {
        machine_id: machine_id,
      },
      limit: 20,
      sort: 'createdAt DESC'
    }).exec(function(err, result) {
      callback("", result);
    });
  },

  doGetMachineById: function(id, action, callback) {
    var query = Machine.find({
      where: {
        machine_id: id,
      },
      limit: 1,
      sort: 'createdAt DESC'
    }).exec(function(err, result) {

    });

    query.exec(function(err, results) {
      console.log(results)
    });
  },

  doGetLastMachineByMachineIdUserName: function(userName, machine_id, callback) {
    var query = Machine.find({
      where: {
        machine_id: machine_id,
        user: userName
      },
      limit: 1,
      sort: 'createdAt DESC'
    }).exec(function(err, result) {

      if (callback != 'undefined') {
        callback("", result[0]);
      }
      console.log(result);
    });

  },
  
  doGetLastMachineByMachineIdUserNameActionId: function(userName, machine_id, action_id, callback) {
    var query = Machine.find({
      where: {
        machine_id: machine_id,
        user: userName,
        action: action_id
      },
      limit: 1,
      sort: 'createdAt DESC'
    }).exec(function(err, result) {

      if (callback != 'undefined') {
        callback("", result[0]);
      }

      console.log(result);
    });
  }
};
