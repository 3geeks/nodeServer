var
  Waterline = require('waterline'),
  uuid = require('node-uuid');

module.exports = Waterline.Collection.extend({
  identity: 'base',
  connection: 'default',
  attributes: {
    id: {
      type: 'text',
      primaryKey: true,
      unique: true,
      defaultsTo: () => {
        return uuid.v4();
      }
    },
    name: 'string',
    ownerid: {
      collection: 'player',
      via: 'id'
    },
    pplayerapeons: 'integer',
    pplayerbpeons: 'integer',
    zone: 'string'
  }
});

