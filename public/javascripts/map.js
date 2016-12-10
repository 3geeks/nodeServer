var
  zones = {},
  map,
  bounds = [
    [48.84600796705691, 2.3889255523681645],
    [48.85061119285312, 2.4006628990173344]
  ],
  bastionsLocations = {
    A: [
      48.84827962715297,
      2.3971411585807805
    ],
    B: [
      48.84763361775165,
      2.3957705497741704
    ]
  },
  bastions = {
    A: null, B: null
  },
  mapLink = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    //'<a href="http://carto.com/basemaps">Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL</a>';
    //'<a href="http://maps.stamen.com/#watercolor/">Map tiles by Stamen</a>. <a href="http://openstreetmap.org">Data by OpenStreetMap, under ODbL</a>';

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
    //'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
    'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '&copy; ' + mapLink + ' Contributors',
    }).setOpacity(0.8).addTo(map);

  // import zones
  $.getJSON('zones.json', function (zonesGJ) {
    zonesGJ.features.forEach(function(feature) {
      var color, opacity, fillColor, fillOpacity, parallaxZoffset, coords = [[]], center, icon, parallaxZoffset;

      color ='#000000';
      fillColor ='#aafaa8';
      opacity = 0.8;
      fillOpacity = 0.5;
      parallaxZoffset = 0.2;
      icon =  L.divIcon({className: 'parallax-marker label small', html: feature.properties.name, iconSize: [200, 36], iconAnchor: [100, 18]});

      feature.geometry.coordinates[0].forEach(function(ll) {
        var point = [];
        point.push(ll[1]);
        point.push(ll[0]);
        coords[0].push(point);
      });

      zones[feature.properties.name] = L.polygon(coords, {
        //dashArray: '4,2',
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

  bastions.A = L.marker(L.latLng(bastionsLocations.A)).addTo(map);
  var icon =  L.divIcon({className: 'parallax-marker label medium a', html: 'Bastion A', iconSize: [200, 36], iconAnchor: [100, 18]});
  L.parallaxMarker(L.latLng(bastionsLocations.A), {icon: icon, parallaxZoffset: 0}).addTo(map);

  bastions.B = L.marker(L.latLng(bastionsLocations.B)).addTo(map);
  icon =  L.divIcon({className: 'parallax-marker label medium b', html: 'Bastion B', iconSize: [200, 36], iconAnchor: [100, 18]});
  L.parallaxMarker(L.latLng(bastionsLocations.B), {icon: icon, parallaxZoffset: 0}).addTo(map);

  /*
    SocketIo interractions
   */

  var socket = io.connect('http://' + window.location.hostname + ':3000');

  socket.on('peon', function (peon) {
    console.log(peon);
  });


});