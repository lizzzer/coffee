var moment = require('moment-timezone');

// api/services/HeroService.js

module.exports = {


  addHeroOfTheWeek: function(user,week_points,hero_nick,callback) {

    var week_number = moment().week() - 2;
    if (hero_nick==undefined) {
      var hero_nick = "The " + nicks[Math.floor(Math.random() * nicks.length)];
    }
    var trophy_url = '/images/trophy' + Math.floor(Math.random() * 5) + '.jpg';
    
    Heroes.create({
      week_number: week_number,
      week_points: week_points,
      user: user,
      hero_nick: hero_nick,
      trophy_url: trophy_url
    }).exec(function(err, hero) {
      callback(err, hero);
    });

  },

  getHeroes: function(callback) {

    Heroes.find({
      limit: 20,
      sort: 'createdAt DESC'
    }).exec(function(err, result) {

      result = result.sort(function(a,b) {
        return b.week_number - a.week_number;
      });

      callback("", result);
    });

  }

};
