/**
 * HeroesController
 *
 * @description :: Server-side logic for managing heroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	doPage: function(req, res) {

		var json = {};

		//HeroService.addHeroOfTheWeek(function(err, hist) {

		//});

		HeroService.getHeroes(function(err, heroes) {

			json.heroes = heroes;

			return res.view('heroespage', json);

		});

	},

};
