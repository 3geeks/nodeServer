var
  zones = {},
  map,
  bounds = [
    [48.84565494147338, 2.3881959915161137],
    [48.85109831928798, 2.400963306427002]
  ];
  mapLink =
    //'<a href="http://carto.com/basemaps">Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL</a>';
    '<a href="http://maps.stamen.com/#watercolor/">Map tiles by Stamen</a>. <a href="http://openstreetmap.org">Data by OpenStreetMap, under ODbL</a>';

$(function() {
  map = L.map('map', {
    center: [48.84838, 2.39592],
    zoom: 18,
    minZoom: 17,
    maxZoom: 19,
    zIndex: 1,
    updateWhenIdle: true,
    maxBounds: bounds
  });

  L.tileLayer(
    //'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
    {
      attribution: '&copy; ' + mapLink + ' Contributors',
    }).setOpacity(0.6).addTo(map);

  // import zones
  $.getJSON('zones.json', function (zonesGJ) {
    zonesGJ.features.forEach(function(feature) {
      var color, opacity, fillColor, fillOpacity = 0.8, coords = [[]], center, icon, parallaxZoffset;

      switch (feature.properties.owner) {
        case 'A':
          color = '#ff0000';
          fillColor ='#ff0000';
          opacity = 0.6;
          fillOpacity = 0.8;
          parallaxZoffset = 1;
          icon =  L.divIcon({className: 'parallax-marker label medium a', html: feature.properties.name, iconSize: [200, 36], iconAnchor: [100, 18]});
          break;
        case 'B':
          color = '#0000ff';
          fillColor ='#0000ff';
          opacity = 0.6;
          fillOpacity = 0.8;
          parallaxZoffset = 1;
          icon =  L.divIcon({className: 'parallax-marker label medium b', html: feature.properties.name, iconSize: [200, 36], iconAnchor: [100, 18]});
          break;
        default:
          color ='#000000';
          fillColor ='#cccccc';
          opacity = 0.8;
          fillOpacity = 0.8;
          parallaxZoffset = 0.2;
          icon =  L.divIcon({className: 'parallax-marker label small', html: feature.properties.name, iconSize: [200, 36], iconAnchor: [100, 18]});
          break;
      }
      feature.geometry.coordinates[0].forEach(function(ll) {
        var point = [];
        point.push(ll[1]);
        point.push(ll[0]);
        coords[0].push(point);
      });

      zones[feature.properties.name] = L.polygon(coords, {
        dashArray: '4,2',
        weight: 1,
        color: color,
        fillColor: fillColor,
        opacity: opacity,
        fillOpacity: fillOpacity
      }).addTo(map);

      center = zones[feature.properties.name].getBounds().getCenter();
      L.parallaxMarker(center, {icon: icon, parallaxZoffset: 0.2}).addTo(map);
    });
  });
});