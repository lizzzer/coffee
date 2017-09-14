/**
 * Heroes.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    user : { type: 'string' },

    week_points : { type: 'integer' },

    week_number : { type: 'integer' },

    hero_nick : { type: 'string' },

    trophy_url : { type: 'string' }

  }
};
