var
  Promise = require('bluebird'),
  rp = require('request-promise'),
  geolib = require('geolib'),
  utils = require('../utils'),

  token = 'GS3K5dUJlSakH7Bq';

function Sensor (name, id, type, coef, coordinates) {
  this.name = name;
  this.url = `https://173.39.240.235:8444/api/query?start=2016/11/29-00:00:00&end=2016/11/29-00:59:59&m=sum:60m-sum-none:placemeter.${type}{}{host=${id}}`;
  this.coef = coef;
  this.coordinates = utils.toPoint(coordinates);
}

Sensor.prototype.harvest = function () {
  return rp({
    uri: this.url,
    headers: {
      'X-TSAPI-TOKEN' : token
    },
    json: true
  })
    .then(data => {
      var val = data[0].dps[Objec.keys(data[0].dps)[0]];
      return val * this.coef;
    });
};

Sensor.prototype.isIn = function (polygon) {
  return geolib.isPointInside(this.coordinates, utils.toPolygon(polygon));
};

module.exports = Sensor;