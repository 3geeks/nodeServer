var
  express = require('express'),             // express framework
  router = express.Router(),                // the router
  Promise = require('bluebird'),            // better promises than native ones
  Waterline = require('waterline'),         // the ORM
  memoryAdapter = require('sails-memory'),  // the adapter for the database
  fs = require('fs'),                       // use the filesystem

  waterlineConfig = {                       // the waterline configuration
    adapters: {
      'memory': memoryAdapter               // named adapters
    },
    connections: {
      default: {
        adapter: 'memory'                   // which is the default adapter to use ?
      }
    }
  },

  dataModels = require('../datamodels'),    // all the data models
  fixtures = require('../fixtures.json'),   // the fixtures
  zones = require('../public/data/zones.json'), // all the zones

  waterline = new Waterline(),              // waterline instance
  DataStores = {},                          // the exposed data stores (via waterline)
  gameReady = false;                        // is the game ready yet ?

// bootstrap functions
Object.keys(dataModels).forEach(modelName => {
  waterline.loadCollection(dataModels[modelName]);  // load all data collections models
});

// initialize waterline (connection to DB, table/collections creation....
waterline.initialize(waterlineConfig, (err, ontology) => {
  if (err) {
    return console.error(err);
  }

  DataStores = ontology.collections;        // expose the data stores
});

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
  var promises = [];

  // 1. delete all data
  promises.push(Object.keys(DataStores)
    .forEach(store => {
      console.log('Destroying', store);
      return DataStores[store].destroy();
    })
  );

  // 2. push the fixtures
  promises.push(Object.keys(fixtures)
    .forEach(store => {
      console.log('Importing fixtures for', store);
      fixtures[store].forEach(data => {
        return DataStores[store].create(data);
      });
    })
  );

  // perform all operations
  Promise.all(promises)
    .then(() => {
      // operations are done: go to the index
      gameReady = true;
      console.log('Game ready!');
      res.redirect('/');
    });
});

/*
  Endpoints
 */

// combien de peons pour :player
router.get('/status/peons/:player', (req, res, next) => {
  res.json({
    success: true,
    result: 10
  });
});

// quel score pour :player
router.get('/status/score/:player', (req, res, next) => {
  res.json({
    success: true,
    result: 10
  });
});

// combien de péons dans :zone pour :player
router.get('/status/peons/:player/zones/:zone', (req, res, next) => {
  res.json({
    success: true,
    result: 10
  });
});

// liste des zones de :player
router.get('/status/zones/:player', (req, res, next) => {
  res.json({
    success: true,
    result: 10
  });
});

// liste des zones (implémenté)
router.get('/status/zones', (req, res, next) => {
  var z = [];

  zones.features.forEach(feature => {
    z.push(feature.properties.name);
  });

  res.json({
    success: true,
    result: z
  });
});

// envoyer des péons de :player
router.post('/cmd/send/:player', (req, res, next) => {
  //{"nb":5,"zone":"2"}
  res.json({
    success: true,
    total: 10
  });
});

// créer des péons de :player
router.post('/cmd/create/:player', (req, res, next) => {
  //{"nb":5}
  res.json({
    success: true,
    total: 10
  });
});

module.exports = router;
