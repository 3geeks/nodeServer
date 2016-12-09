$(function() {
  var map = L.map('map', {
    center: [48.84838, 2.39592],
    zoom: 18,
    zoomControl: false
  }),

  mapLink =
    '<a href="http://carto.com/basemaps">Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL</a>';

  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tap) map.tap.disable();
  document.getElementById('map').style.cursor='default';

  L.tileLayer(
    'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; ' + mapLink + ' Contributors',
      maxZoom: 18,
    }).addTo(map);

  // import zones
  $.getJSON('zones.json?' + Date.now(), function (zones) {
    L.geoJSON(zones, {
      style: function(feature) {
        switch (feature.properties.owner) {
          case 'A':
            return {
              weight: 2,
              opacity: 1,
              color: '#ff0000',
              dashArray: '3',
              fillOpacity: 0.6,
              fillColor: '#ff0000'
            };
            break;
          case 'B':
            return {
              weight: 2,
              opacity: 1,
              color: '#0000ff',
              dashArray: '3',
              fillOpacity: 0.6,
              fillColor: '#0000ff'
            };
            break;
          default:
            return {
              weight: 2,
              opacity: 1,
              color: '#cccccc',
              dashArray: '3',
              fillOpacity: 0.1,
              fillColor: '#cccccc'
            };
            break;
        }
      }
    }).addTo(map);
  });
});