var
  pg = require('../utils/person-generator'),
  person = pg.get(),
  name = person.firstName + ' ' + person.middleName + ' ' + person.lastName;

function Peon(name, player, toBase) {
  this.owner = player;
  this.name = name;
  this.currentPos = player.bastion.coordinates;
  this.headingBase = toBase;
  this.headincCoordinates = toBase.center;
  console.log('==== Peon', name, 'owned by', player.name, 'created.');
}

Peon.prototype.setHeadingBase = function (base) {
  this.headingBase = base;
  this.headingCoordinates = base.center;
};

module.exports = Peon;

