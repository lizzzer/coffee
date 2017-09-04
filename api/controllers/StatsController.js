var moment = require('moment');

/**
 * StatsController
 *
 * @description :: Server-side logic for managing Stats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	doShowMachineMaintenance: function(req, res) {

		var params = req.params.all();

		MachineService.doGetMachineHistory(function(err, hist) {

			json = hist;
			json.history = hist;
			json.moment = moment;
			json.layout='plain';

			return res.view('stat_history', json);

		});

	},

	doShowPoints: function(req, res) {

		var params = req.params.all();

		UserService.doGetAllUsers(function(err, resp) {
			json = resp;
			json.layout='plain';
			return res.view('stat_points', json);
		});
	}

};
