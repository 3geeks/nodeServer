var
  Promise = require('bluebird'),
  energyPerPeon = 10;

function Player(name, bastion) {
  this.name = name;
  this.bastion = bastion;
  this.energy = 0;
  this.peons = {
    toCreate: 10,
    alive: {}
  };
  this.bases = {};
}

Player.prototype.giveEnergy = function (amount) {
  this.energy += amount;
  return this;
};

Player.prototype.createPeon = function (amount) {
  var consumeEnergy = amount * energyPerPeon;
  if (this.energy >= consumeEnergy) {
    this.energy -= consumeEnergy;
    this.peons.toCreate += amount;
    return true;
  }
  return false;
};

module.exports = Player;


