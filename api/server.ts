'use strict';

// ENV set up
require('dotenv').config();
const PORT = 3210||process.env.PORT;

// Dependencies
import express = require('express');
import http = require('http');
import bodyParser = require('body-parser');
import url = require('url');

import cors = require('cors');
const fs = require('fs');
const worldAggregated  = 'https://raw.githubusercontent.com/datasets/covid-19/master/data/worldwide-aggregated.csv';

const csv2json = require('csv2json');
const request = require('request');
const path = require('path');


 
request(worldAggregated)
  .pipe(csv2json({
    // Defaults to comma.
    separator: ','
  }))
  .pipe(fs.createWriteStream('./assets/world-covid-aggregated/data.json'));


const geoJson = require('./assets/countries.json');
let tmp = geoJson.features;

const app = express();
const server = http.createServer(app);
app.use(cors());

// Parsing & Initialization
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

app.get('/is-alive', (req, res) => res.sendStatus(200));

// Swagger set up
server.listen(PORT, () => console.log('Server listening on port '+ PORT));

app.get('/getPolygon', (req, res) => {
    tmp.forEach(element => {
      let elementCountry = element.properties.ADMIN;
      if(elementCountry==req.query.country){
        let tmp = {
          ISO_A3: element.properties.ISO_A3
        }
        res.send(tmp);
      }
    })
});

app.get('/worldwide-aggregated', (req, res) => {
  res.sendFile(path.join(__dirname, './assets/world-covid-aggregated/data.json'));
  // res.json(`{./assets/world-covid-aggregated/data.json}`);
})