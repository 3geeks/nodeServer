var
  socket = io.connect('http://' + window.location.hostname + ':3000'),
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
  peons = {},
  peonsIcon = {
    A: L.icon({
      iconUrl: './images/player-A.png',

      iconSize: [10, 10],
      iconAnchor: [5, 5],
      popupAnchor: [5, 0],
      className: 'peon'
    }),
    B: L.icon({
      iconUrl: './images/player-B.png',

      iconSize: [10, 10],
      iconAnchor: [5, 5],
      popupAnchor: [5, 0],
      className: 'peon'
    })
  },
  bastionsIcon = {
    A: L.icon({
      iconUrl: './images/bastion-A.png',

      iconSize: [78, 79],
      iconAnchor: [39, 39],
      popupAnchor: [39, 0]
    }),
    B: L.icon({
      iconUrl: './images/bastion-B.png',

      iconSize: [78, 79],
      iconAnchor: [39, 39],
      popupAnchor: [39, 0]
    })
  },
  colors = {
    A: '#00f',
    B: '#f00'
  },
  clientUUID = '',
  me = '',
  start = false,
  mapLink = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    //'<a href="http://carto.com/basemaps">Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL</a>';
    //'<a href="http://maps.stamen.com/#watercolor/">Map tiles by Stamen</a>. <a href="http://openstreetmap.org">Data by OpenStreetMap, under ODbL</a>';

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}
clientUUID = generateUUID();

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

      zones[feature.properties.name.toLowerCase()] = L.polygon(coords, {
        //dashArray: '4,2',
        weight: 1,
        color: color,
        fillColor: fillColor,
        opacity: opacity,
        fillOpacity: fillOpacity
      }).addTo(map);

      center = zones[feature.properties.name.toLowerCase()].getBounds().getCenter();
      L.parallaxMarker(center, {icon: icon, parallaxZoffset: 0.2}).addTo(map);
    });
  });

  bastions.A = L.marker(L.latLng(bastionsLocations.A), {icon: bastionsIcon.A}).addTo(map);
  bastions.B = L.marker(L.latLng(bastionsLocations.B), {icon: bastionsIcon.B}).addTo(map);

  function hideWelcome () {
    $('.dark').addClass('off');
    $('.logo').addClass('off');
  }

  $('.logo').on('click', function() {
    $.get('http://' + window.location.hostname + ':3000/start', function() {
      start = true;
      hideWelcome();
    });
  });

  $.json('http://' + window.location.hostname + ':3000/isstarted', function(data) {
    if (data.gameStarted) {
      start = true;
      hideWelcome();
    }
  });

  socket.on('start', function() {
    if (!start) {
      start = true;
      hideWelcome();
    }
  });

  socket.on('peon', function (peon) {
    console.log('create', peon.name);
    peons[peon.name] = L.Marker.movingMarker([peon.from, peon.to], [5000], {icon: peonsIcon[peon.owner], autostart: true}).addTo(map);
    peons[peon.name].on('end', function() {
      map.removeLayer(peons[peon.name]);
      console.log('killing', peon.name);
    });
    console.log(peons);
  });

  socket.on('energy', function(energy) {
    console.log('energy', energy,(energy.A / 10000));
    $('#agauge').css('width', energy.A + '%');
    $('#bgauge').css('width', energy.B + '%');
  });

  socket.on('winner', function(player) {
    $('.dark').removeClass('off');
    $('.logo').removeClass('off');
    $('#winner')
      .removeClass('off')
      .html('Joueur' + player +'<br>gagne la partie !')
      .css('color', colors[player]);
  });

  socket.on('base', function(data) {
    zones[data.name].setStyle({
      fillColor: colors[data.owner],
      color: colors[data.owner]
    });
  });

  socket.on(clientUUID, function(data) {

  });
});