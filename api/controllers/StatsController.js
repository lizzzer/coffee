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

	doCheckMaintenanceStatus: function(req, res) {

		var params = req.params.all();

		// hardcode machine_id for now
		// @todo add support to different status checks with different id:s

		MachineService.doGetMachineDetailedHistory('2', function(err, hist_detail) {

			var json = hist_detail;
			json.moment = moment;
			json.status = true;
			json.layout='plain';

			if (hist_detail.length>0 && hist_detail[0].createdAt!=undefined) {

				date = hist_detail[0].createdAt;
				var diff = 0;

				if (date != undefined) {
					diff = Math.abs(new Date().getTime() - date.getTime()) / 3600000;

					if (diff>36) {

						var text = "Simonellaa ei ole kuulkaas putsattu sitten "+date+"\nKoittakaas nyt";

						NotifyService.sendNotifyToSlack(text, function(err) {
							if (err) {
								return res.serverError(err);
							}

							return res.ok();
						});
					}

				}
			} else {
				json.status=false;

				var text = "Putsatkaas nyt joku se Barista";

				NotifyService.sendNotifyToSlack(text, function(err) {
					if (err) {
						return res.serverError(err);
					}

					return res.ok();
				});

			}

			return res.view('stat_status', json);
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
