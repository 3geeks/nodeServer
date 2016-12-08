var
  Waterline = require('waterline'),
  uuid = require('node-uuid');

module.exports = Waterline.Collection.extend({
  identity: 'player',
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
    score: 'float',
    freepeons: 'float'
  }
});

