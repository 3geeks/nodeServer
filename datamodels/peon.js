var
  Waterline = require('waterline'),
  uuid = require('node-uuid');

module.exports = Waterline.Collection.extend({
  identity: 'peon',
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
    currentlat: 'float',
    currentlon: 'float',
    headingbase: {
      collection: 'base',
      via: 'id'
    },
    headinglat: 'float',
    headinglon: 'float'
  }
});

