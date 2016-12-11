var
  pg = require('../utils/person-generator');

function Peon(name, player, toBase) {
  var
    person = pg.get(),
    name = person.firstName + ' ' + person.middleName + ' ' + person.lastName;

  this.owner = player;
  this.name = name;
  this.currentPos = [player.bastion.coordinates[0] + (Math.random() / 3000), player.bastion.coordinates[1] + (Math.random() / 3000)];
  this.headingBase = toBase;
  this.headincCoordinates = {latitude: toBase.center.latitude + (Math.random() / 3000), longitude: toBase.center.longitude + (Math.random() / 3000)};
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

