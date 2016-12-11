var
  express = require('express'),             // express framework
  router = express.Router(),                // the router
  Promise = require('bluebird'),            // better promises than native ones
  fs = require('fs'),                       // use the filesystem
  _ = require('lodash'),
  utils = require('../utils'),
  rj = require('request-json'),
  request = rj.createClient('http://109.202.107.147:20808/'),
  businessClasses = require('../datamodels'), // all the data models
  zonesGJ = require('../public/data/zones.json'), // all the zones
  sensorsGJ = require('../public/data/sensors.json'), // the sensors

  gameReady = false,                        // is the game ready yet ?
  gameStarted = false,                      // is the game started

  // business objects
  players = {
    A: {},
    B: {}
  },
  sensors = [],
  bases = {},

  // internal objects
  mainLoop,                                 // the main loop function
  mainLoopTimer,                            // setInterval object
  stackPointer = 0,                         // the pointer to the stack
  movingPeonsStack = [],                    // the moving peons stack
  io,
  winner,
  provizionOptions = {
  url: 'http://109.202.107.147:20808/AutoFlow/TasksManager/rest/NodeJSWebHooks',
  headers: {
    'Accept': 'application/json'
  }
};

/**********************************************************************************************************************
  Business objects init
 **********************************************************************************************************************/
function setUp() {
  console.log('========= Setup begins.');
  // 1. players
  players.A = new businessClasses.Player('A', {
    name: 'Bastion A',
    coordinates: [
      2.3971411585807805,
      48.84827962715297
    ]
  });
  players.B = new businessClasses.Player('B', {
    name: 'Bastion B',
    coordinates: [
      2.3957705497741704,
      48.84763361775165
    ]
  });

  // 2. sensors
  sensorsGJ.features.forEach(feature => {
    var name, id, type, coef, coordinates;
    name = feature.properties.name;
    id = feature.properties.id;
    if (feature.properties.measure_2 === 'bike') {
      type = 'bike';
    } else {
      type = feature.properties.measures;
    }
    switch (type) {
      case 'ped':
        coef = 4;
        break;
      case 'bike':
        coef = 2;
        break;
      case 'vehicule':
        coef = 1;
    }
    coordinates = feature.geometry.coordinates;
    sensors.push(new businessClasses.Sensor(name, id, type, coef, coordinates));
  });

  // 3. bases
  zonesGJ.features.forEach(feature => {
    var name, geometry, baseSensors=[];
    name = feature.properties.name.toLowerCase().replace("'",'').replace('é','e').replace('ô', 'o');
    console.log('integrating base',name);

    geometry = feature.geometry.coordinates;

    sensors.forEach(sensor => {
      if (sensor.isIn(geometry)) {
        baseSensors.push(sensor);
      }
    });
    bases[name] = new businessClasses.Base(name, players, geometry, baseSensors);
  });

  // 4. moving peons stack
  movingPeonsStack = _.fill(Array(11), []);

  winner = false;
  gameReady = true;
  console.log('========= Setup ends.');
  console.log('========= Start the loop.');
  mainLoopTimer = setInterval(mainLoop, 1 * 1000);
}

/**********************************************************************************************************************
 Loops
 **********************************************************************************************************************/

mainLoop = () => {
  console.log('====== New tick:', stackPointer, movingPeonsStack);
  if (!gameReady | !gameStarted) {
    console.log('!!!! Game not ready/started yet!');
    return;
  }

  // move peons
  if (!movingPeonsStack[stackPointer]) {
    stackPointer++;
    if (stackPointer == 11) {
      stackPointer = 0;
    }
    return;
  }
  movingPeonsStack[stackPointer].forEach(currentTask => {
    currentTask();
  });

  // report ownerships
  players.A.bases = {};
  players.B.bases = {};
  Object.keys(bases).forEach(base => {
    if (base.owner) {
      players[base.owner].bases[base.name] = base;
    }
  });

  // harvest
  Object.keys(bases).forEach(baseName => {
    bases[baseName].harvestEnergy();
  });

  // send scores
  io.emit('energy', {
    A: players.A.energy,
    B: players.B.energy
  });

  if (players.A.energy >= 100 || players.B.energy >= 100) {
    gameStarted = false;
    gameReady = false;
    clearTimeout(mainLoopTimer);
  }
  if (players.A.energy >= 100) {
    winner = players.A;
  }
  if (players.B.energy >= 100) {
    winner = players.B;
  }
  if (winner) {
    io.emit('winner', winner.name);
    request.post('/AutoFlow/TasksManager/rest/NodeJSWebHooks', {
      setup_name: 'CiscoPhilipsHue',
      fields: {
        message: 'Le joueur ' + winner.name + ' a gagné',
        turn: 'on',
        color: (winner.name === 'B') ? 'red' : 'blue'
      }
    });
    setUp();
  }
  // empty the current stack tasks
  movingPeonsStack[stackPointer] = [];

  // step up into the stack
  stackPointer++;
  if (stackPointer == 11) {
    stackPointer = 0;
  }
};

setUp();

/**********************************************************************************************************************
  Routes definitions
 **********************************************************************************************************************/

// Meraki endpoint
router.all('/ciscohackathon/meraki', (req, res, next) => {
  console.log('Meraki recieved', req.params);
});

/*
  Display the game board
 */
router.get('/', (req, res, next) => {
  io = res.io;
  if (!gameReady) {
    console.log('Game not ready yet!');
    res.redirect('/reset');
  }
  res.render('index', {title: 'WarNation'});
});

router.get('/zones.json', (req, res, next) => {
  res.type('application/json').json(require('../public/data/zones.json'));
});

/*
  Reset the game
  - empty all the databases
  - import the fixtures
  -
 */
router.get('/reset', (req, res, next) => {
  setUp();
  // operations are done: go to the index
  gameReady = true;
  console.log('Game ready!');
  res.redirect('/');
});

router.get('/start', (req, res, next) => {
  gameStarted = true;

  request.post('/AutoFlow/TasksManager/rest/NodeJSWebHooks', {
    setup_name: 'CiscoPhilipsHue',
    fields: {
      message: 'La partie commence!',
      turn: 'on',
      color: 'green'
    }
  });

  io.emit('start', {});

  res.json({
    success: true,
  });
});

router.get('/isstarted', (req, res, next) => {
  var b = {};
  Object.keys(bases).forEach(bb => {
    b[bb] = (bases[bb].owner) ? bases[bb].owner.name : 'O';
  });
  res.json({
    gameStarted: gameStarted,
    bases: b
  });
});

router.get('/stop', (req, res, next) => {
  gameStarted = false;
  gameReady = false;
  setUp();
  request.post('/AutoFlow/TasksManager/rest/NodeJSWebHooks', {
    setup_name: 'CiscoPhilipsHue',
    fields: {
      message: 'La partie a été arrétée.',
      turn: 'off'
    }
  });
  io.emit('stop', {});
  res.json({
    success: true
  });
});

// scores
router.get('/scores', (req, res, next) => {
  res.json({
    succcess: true,
    A: players.A.energy,
    B: players.B.energy
  });
});

/*
  Endpoints
 */

// combien de peons pour :player (implémenté)
router.get('/status/peons/:player', (req, res, next) => {
  var player = players[req.param('player')];
  res.json({
    success: true,
    result: player.peons.toCreate
  });
});

// quel score pour :player (implémenté)
router.get('/status/score/:player', (req, res, next) => {
  var player = players[req.param('player')];
  res.json({
    success: true,
    result: player.energy
  });
});

// combien de péons dans :zone pour :player (implémenté)
router.get('/status/peons/:player/zones/:zone', (req, res, next) => {
  var
    base = bases[req.params.zone],
    player = req.params.player;
  res.json({
    success: true,
    result: base.peons[player]
  });
});

// liste des zones de :player (implémenté)
router.get('/status/zones/:player', (req, res, next) => {
  res.json({
    success: true,
    result: Object.keys(players[req.params.player].bases).sort()
  });
});

// liste des zones (implémenté)
router.get('/status/zones', (req, res, next) => {
  var z = [];

  zonesGJ.features.forEach(feature => {
    z.push(feature.properties.name);
  });

  res.json({
    success: true,
    result: z.sort()
  });
});

// envoyer des péons de :player (implémenté)
router.post('/cmd/send/:player', (req, res, next) => {
  //{"nb":5,"zone":"2"}
  var player, nb, base, i, name, sp;

  if (bases[req.body.zone] === undefined) {
    res.json({
      success: false,
      message: 'La base ' + req.body.zone + ' n\'existe pas...'
    });
  }

  player = players[req.params.player];
  nb = req.body.nb;
  base = bases[req.body.zone];
  name = utils.generateName();

  if (player.peons.toCreate >= nb) {
    // if there are enough peons
    player.peons.toCreate -= nb;
    // decrement the peons nb
    for (i = 0; i < nb; i++) {
      player.peons.alive[name] = new businessClasses.Peon(name, player, base);
      res.io.emit('peon', player.peons.alive[name].json());
      sp = stackPointer + 5;
      if (sp > 10) {
        sp = sp - 10;
      }
      // add the task to the stack
      if (!movingPeonsStack[sp]) {
        movingPeonsStack[sp] = [];
      }
      movingPeonsStack[sp].push(() => {
        var oldOwner, message;
        // - add the peon to the base for the player
        // - remove a peon from the base for the opposite player
        if (base.peons[player.name] < 3) {
          base.peons[player.name]++;
        }
        if (player.name == 'A') {
          base.peons.B--;
          if (base.peons.B < 0) {
            base.peons.B = 0
          }
        } else {
          base.peons.A--;
          if (base.peons.A < 0) {
            base.peons.A = 0
          }
        }
        // - kill the peon
        delete player.peons.alive[name];

        // - compute ownership
        if (base.peons.A === 3) {
          console.log('______________________________________________________',base.owner);
          oldOwner = base.owner;
          base.owner = players.A;
          if (oldOwner === base.owner) {
            return;
          }
          console.log('-------------- base', base.name,'remportée par A !!!!!!!!');
          message ='Le joueur A vient de remporter la zone ' + base.name + ' !';

          var b = {};
          Object.keys(bases).forEach(bb => {
            b[bb] = (bases[bb].owner) ? bases[bb].owner.name : 'O';
          });

          res.io.emit('bases', b);

          console.log('______________________________________________________',oldOwner);

          if (oldOwner) {
            message = 'Le joueur A a repris la zone ' + base.name + ' au joueur B !';
          }
          request.post('/AutoFlow/TasksManager/rest/NodeJSWebHooks', {
            setup_name: 'CiscoAlerts',
            fields: {
              message: message
            }
          });
        }
        if (base.peons.B === 3) {
          oldOwner = base.owner;
          base.owner = players.B;
          if (oldOwner === base.owner) {
            return;
          }
          console.log('-------------- base', base.name,'remportée par',base.owner,'!!!!!!!!');
          message ='Le joueur B vient de remporter la zone ' + base.name + ' !';

          var b = {};
          Object.keys(bases).forEach(bb => {
            b[bb] = (bases[bb].owner) ? bases[bb].owner.name : 'O';
          });

          res.io.emit('bases', b);

          if (oldOwner) {
            message = 'Le joueur B a repris la zone ' + base.name + ' au joueur A !';
          }
          request.post('/AutoFlow/TasksManager/rest/NodeJSWebHooks', {
            setup_name: 'CiscoAlerts',
            fields: {
              message: message
            }
          });
        }

        return true;
      });
    }
    res.json({
      success: true,
      total: player.peons.toCreate
    });
    return true;
  }
  res.json({
    success: false,
    message: 'Désolé, tu n\'as pas assez de péons...'
  });
});

// créer des péons de :player (implémenté)
router.post('/cmd/create/:player', (req, res, next) => {
  //{"nb":5}
  var player = players[req.params.player];
  if (player.createPeon(parseInt(req.body.nb))) {
    res.json({
      success: true,
      total: player.peons.toCreate
    });
  } else {
    res.json({
      success: false,
      message: 'Pas assez d\'énergie, vous en avez ' + player.energy
    });
  }

});

module.exports = router;
