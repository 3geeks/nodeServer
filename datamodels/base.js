var
  geolib = require('geolib'),
  utils = require('../utils');

function Base (name, players, geometry, sensors) {
  this.players = players;
  this.name = name;
  this.owner = null;
  this.peons = {
    A: 0,
    B: 0
  };
  this.geometry = geometry;
  this.sensors = sensors;
  this.energy = 0;
  this.center = geolib.getCenter(utils.toPolygon(geometry));
}

Base.prototype.setPeons = function setPeons(nb, player) {
  this.peons[player] += nb;
  if (player == A) {
    this.peons.B -= nb;
  } else {
    this.peons.A -= nb;
  }
  return this;
};

Base.prototype.checkOwner = function checkOwner(nb, player) {
  Object.keys(this.peons).forEach(player => {
    if (this.peons >= 4) {
      this.owner = this.player[player];
    }
    return this;
  });
};

Base.prototype.harvestEnergy = function giveEnergy () {
  if (this.owner !== null) {
    this.sensors.forEach(sensor => {
      this.energy += sensor.harvest()
    });

    this.owner.giveEnergy(this.energy);
    this.energy = 0;
  } else {
    this.energy = 0;
  }
  return this;
};

module.exports = Base;