var moment = require('moment-timezone');

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
	doGetHeroOfTheWeek: function(req, res) {

		var params = req.params.all();

		UserService.doGetHeroOfTheWeek( function(err, data) {
			var json = new Object();
			var matrix = {};
			for (var i = 0; i < data.length; i++){
			    var machine = data[i];
					if (machine.user!=undefined && machine.user!='' && machine.awarded_points!=undefined) {
						if ( matrix[machine.user] == undefined) {
								matrix[machine.user] = machine.awarded_points;
						} else {
							matrix[machine.user] = matrix[machine.user]+machine.awarded_points;
						}

					}
			}
			if (!_.isEmpty(matrix)) {
				var winner = _.max(Object.keys(matrix), function (o) { return matrix[o]; });
				json.winnerName = winner;
				json.winnerPoints = matrix[winner];
				json.noWinners = false;
			} else {
				json.noWinners = true;
			}

			if (!json.noWinners) {
				var nicks = sails.config.heroes['nicks'];
				var nick = "The " + nicks[Math.floor(Math.random() * nicks.length)];
				var text = {
	        "attachments": [
	        {
	            "fallback": "Nothing here anymore.",
	            "color": "#36a64f",
	            "pretext": "And the week has gone yet again..",
	            "author_name": "Philanthropist",
	            "title": "Hero of the week award!",
							"title_link": "http://"+sails.config.c_hostname+sails.config.c_port+"/ourHeroes",
	            "text": json.winnerName+" _"+nick+"_ with "+json.winnerPoints+" points!\n*We salute you!*",
							"image_url": "http://icons.iconarchive.com/icons/iconshock/super-vista-business/256/trophy-icon.png",
	            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
	            "ts": +Math.floor(new Date().valueOf() / 1000),
							"mrkdwn_in": ["text"]
	        }
	      ]
			};

			HeroService.addHeroOfTheWeek(json.winnerName,json.winnerPoints,nick,function(err, hist) {
				if (err) {
					sails.log('Could not add hero: '+err);
				} else {
					sails.log('added weekly hero');
				}

			});

			} else {
				var text = {
					"attachments": [
					{
							"fallback": "Nothing here anymore.",
							"color": "#36a64f",
							"pretext": "And the week has gone yet again..",
							"author_name": "Philanthropist",
							"title": "Hero of the week award",
							"text": "No heroes this week.. So Sad..",
							"image_url": "https://www.darkknightarmoury.com/images/Category/medium/504.png",
							"footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
							"ts": +Math.floor(new Date().valueOf() / 1000)
					}
				]
			};
			}

			if (params.populate=='true') {
				json.layout='plain';
				return res.view('stat_hero', json);
			} else {
				NotifyService.sendRichNotifyToSlack(text, function(err) {
					if (err) {
						return res.serverError(err);
					}
					return res.ok();
				});
			}

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
