var
  Waterline = require('waterline'),
  uuid = require('node-uuid');

module.exports = Waterline.Collection.extend({
  identity: 'spot',
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
    baseId: {
      collection: 'base',
      via: 'id'
    },
    name: 'string',
    lat: 'float',
    lon: 'float',
    bikes: 'integer',
    peoples: 'integer'
  }
});

