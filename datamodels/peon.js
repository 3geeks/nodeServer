var
  pg = require('../utils/person-generator');

function Peon(name, player, toBase) {
  var
    person = pg.get(),
    name = person.firstName + ' ' + person.middleName + ' ' + person.lastName;

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

Peon.prototype.json = function() {
  return {
    owner: this.owner.name,
    name: this.name,
    from: [this.currentPos[1], this.currentPos[0]],
    to: [this.headincCoordinates.longitude, this.headincCoordinates.latitude],
    toBase: this.headingBase.name
  }
};

module.exports = Peon;

