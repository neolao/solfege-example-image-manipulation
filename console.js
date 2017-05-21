#!/usr/bin/env node

var solfege = require('solfegejs');

// Initialize the application
var application = solfege.factory();

// Add the internal bundle
var ImageManipulation = require('./lib/Bundle');
application.addBundle(new ImageManipulation);

// Start the application
var parameters = process.argv.slice(2);
application.start(parameters);
