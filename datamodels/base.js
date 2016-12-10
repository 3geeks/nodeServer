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
  this.energy = 0;
  this.center = geolib.getCenter(utils.toPolygon(geometry));
}

Base.prototype.harvestEnergy = function giveEnergy () {
  var promises = [];
  if (this.owner !== null) {
    this.sensors.forEach(sensor => {
      promises.push(() => {
        console.log('----------------- harvesting starting');
        sensor.harvest()
          .then(energy => {
            console.log('------------- energy', energy);
            this.energy += energy;
          });
      });
    });
    Promise.all(promises)
      .then(() => {
        console.log('===== Give', this.energy, 'energy to', this.owner.name);
        this.owner.giveEnergy(this.energy);
        this.energy = 0;
      });
  } else {
    this.energy = 0;
  }
};

module.exports = Base;