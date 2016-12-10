var
  express = require('express'),             // express framework
  router = express.Router(),                // the router
  Promise = require('bluebird'),            // better promises than native ones
  fs = require('fs'),                       // use the filesystem
  _ = require('lodash'),
  utils = require('../utils'),

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
  movingPeonsStack = [];                    // the moving peons stack

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
    name = feature.properties.name;
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

  gameReady = true;
  console.log('========= Setup ends.');
}

/**********************************************************************************************************************
 Loops
 **********************************************************************************************************************/

mainLoop = () => {
  console.log('====== New tick:', stackPointer, movingPeonsStack);
  if (!gameReady) {
    console.log('!!!! Game not ready yet!');
    return;
  }
  // harvest
  Object.keys(bases).forEach(baseName => {
    bases[baseName].harvestEnergy();
  });

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

  // empty the current stack tasks
  movingPeonsStack[stackPointer] = [];

  // step up into the stack
  stackPointer++;
  if (stackPointer == 11) {
    stackPointer = 0;
  }
};

setUp();

mainLoopTimer = setInterval(mainLoop, 1 * 1000);

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

// scores
router.get('/scores', (req, res, next) => {
  res.json({
    status: true,
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
    base = bases[req.param('zone')],
    player = req.param('player');
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

// envoyer des péons de :player (implémenté, manque websocket)
router.post('/cmd/send/:player', (req, res, next) => {
  //{"nb":5,"zone":"2"}
  var player, nb, base, i, name, sp;

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
        console.log('===== Sending peon...');
        // - add the peon to the base for the player
        // - remove a peon from the base for the opposite player
        if (base.peons[player.name] < 3) {
          base.peons[player.name]++;
        }
        if (player.name == 'A') {
          base.peons.B--
          if (base.peons.B < 0) {
            base.peons.B = 0
          }
        } else {
          base.peons.A--;
          if (base.peons.A < 0) {
            base.peons.A = 0
          }
        }
        console.log('-------------- base', base.name,base.peons);
        // - kill the peon
        delete player.peons.alive[name];

        // - compute ownership
        if (base.peons.A === 3) {
          base.owner = players.A;
        }
        if (base.peons.B === 3) {
          base.owner = players.B;
        }

        return true;
      });
    }
    res.json({
      success: true,
      total: player.peons.toCreate
    });

  }
});

// créer des péons de :player (implémenté)
router.post('/cmd/create/:player', (req, res, next) => {
  //{"nb":5}
  var player = players[req.param('player')];
  if (players.createPeon(req.param('nb'))) {
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
