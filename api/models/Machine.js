/**
 * Machine.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    machine_id : { type: 'string' },

    action : { type: 'integer' },

    user : { type: 'string' },

    awarded_points : { type: 'integer' },

    history_message : { type: 'string' }

  }
};
