var
  geolib = require('geolib'),
  utils = require('../utils'),
  Promise = require('bluebird');

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
  this.center = geolib.getCenter(utils.toPolygon(geometry));
}

Base.prototype.harvestEnergy = function giveEnergy () {
  if (this.owner !== null) {
    this.sensors.forEach(sensor => {
      console.log('harvesting sensor', sensor.name);
      sensor.harvest()
        .then(energy => {
          this.owner.giveEnergy(energy / 1000);
        });
    });
  }
};

module.exports = Base;