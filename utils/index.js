var
  toPoint = array => {
    return {
      latitude: array[0],
      longitude: array[1]
    };
  },
  toPolygon = array => {
    var polygon = [];
    array[0].forEach(coords => {
      polygon.push(toPoint(coords));
    });
    return polygon;
  },
  generateName = () => {
    var
      pg = require('./person-generator'),
      person = pg.get();
    return person.firstName + ' ' + person.middleName + ' ' + person.lastName;
  };

module.exports = {
  toPoint: toPoint,
  toPolygon: toPolygon,
  generateName: generateName
};