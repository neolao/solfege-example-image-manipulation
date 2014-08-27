var solfege = require('solfegejs');

// Initialize the application
var application = new solfege.kernel.Application(__dirname);

// Add the external bundles
var solfegeCli = require('solfegejs-cli');
application.addBundle('console', new solfegeCli.Console);

// Add the internal bundle
var ImageManipulation = require('./bundles/imageManipulation');
application.addBundle('imageManipulation', new ImageManipulation);

// Start the application
application.start();
