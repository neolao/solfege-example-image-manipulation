var solfege = require('solfegejs');

/**
 * Simple proxy to ImageMagick
 */
var ImageManipulation = solfege.util.Class.create(function()
{
    // Set the default configuration
    this.configuration = require('./configuration/default.js');

}, 'solfege.example.imageManipulation.ImageManipulation');
var proto = ImageManipulation.prototype;

/**
 * The configuration
 *
 * @private
 * @member  {Object} solfege.example.imageManipulation.ImageManipulation.prototype.imageMagickIdentifyAvailable
 */
proto.configuration;

/**
 * Indicates that the command "identify" of ImageMagick is available
 *
 * @private
 * @member  {Boolean} solfege.example.imageManipulation.Imageanipulation.prototype.imageMagickIdentifyAvailable
 */
proto.imageMagickIdentifyAvailable;

/**
 * Indicates that the command "convert" of ImageMagick is available
 *
 * @private
 * @member  {Boolean} solfege.example.imageManipulation.Imageanipulation.prototype.imageMagickConvertAvailable
 */
proto.imageMagickConvertAvailable;


/**
 * Get the configuration
 * It is used by solfege.bundle.cli
 *
 * @return  {Object} The configuration
 */
proto.getConfiguration = function()
{
    return this.configuration;
};


/**
 * Display informations about an image
 *
 * @param   {String} imagePath - The image path
 */
proto.identify = function*(imagePath)
{
    var commandAvailable = yield this.imageMagickIdentifyCheck();
    if (!commandAvailable) {
        console.error('Command "identify" is not available, please install ImageMagick');
        return;
    }

    var informations = yield this.imageMagickIdentify(imagePath);

    console.log(informations);
};


/**
 * Rotate an image 90° clockwise
 *
 * @param   {String} imagePath - The image path
 */
proto.rotateClockwise = function*(imagePath)
{
    var commandAvailable = yield this.imageMagickConvertCheck();
    if (!commandAvailable) {
        console.error('Command "convert" is not available, please install ImageMagick');
        return;
    }

    var result = yield this.imageMagickConvert(imagePath, ['-rotate 90']);

    console.log('Done');
};


/**
 * Rotate an image 90° counter clockwise
 *
 * @param   {String} imagePath - The image path
 */
proto.rotateCounterClockwise = function*(imagePath)
{
    var commandAvailable = yield this.imageMagickConvertCheck();
    if (!commandAvailable) {
        console.error('Command "convert" is not available, please install ImageMagick');
        return;
    }

    var result = yield this.imageMagickConvert(imagePath, ['-rotate -90']);

    console.log('Done');
};


/**
 * Check if the "identify" command of ImageMagick is available
 *
 * @private
 * @return  {Boolean} true if the command is available, false otherwise
 */
proto.imageMagickIdentifyCheck = function()
{
    var self = this;
    var exec = require('child_process').exec;

    if (self.imageMagickIdentifyAvailable !== undefined) {
        return function(done) {
            done(null, self.imageMagickIdentifyAvailable);
        };
    }

    return function(done) {
        exec("identify", function (error, stdout, stderr) {
            if (error || stderr) {
                // identify not available
                self.imageMagickIdentifyAvailable = false;
            } else {
                self.imageMagickIdentifyAvailable = true;
            }

            done(null, self.imageMagickIdentifyAvailable);
        });
    }
};

/**
 * Execute the "identify" command of ImageMagick
 *
 * @private
 * @param   {String} filePath - The file path
 */
proto.imageMagickIdentify = function(filePath)
{
    var exec = require('child_process').exec;
    var command = 'identify -format "%m %z %w %h %b %f" "' + filePath + '"';

    return function(done) {
        exec(command, function(error, stdout, stderr) {
           if (stderr.match(/^identify:/)) {
                done(new Error('Unsupported image'));
            } else {
                var temp = stdout.replace('PixelsPerInch', '').split(' ');

                if (temp.length < 6) {
                    done(new Error('Unsupported image'));
                } else {
                    var info     = {};
                    info.type    = temp[0];
                    info.depth   = parseInt(temp[1]);
                    info.width   = parseInt(temp[2]);
                    info.height  = parseInt(temp[3]);
                    info.size    = parseInt(temp[4]);
                    info.name    = temp.slice(5).join(' ').replace(/(\r\n|\n|\r)/gm,'');

                    done(null, info);
                }
            }
        });
    };
};


/**
 * Check if the "convert" command of ImageMagick is available
 *
 * @private
 * @return  {Boolean} true if the command is available, false otherwise
 */
proto.imageMagickConvertCheck = function()
{
    var self = this;
    var exec = require('child_process').exec;

    if (self.imageMagickConvertAvailable !== undefined) {
        return function(done) {
            done(null, self.imageMagickConvertAvailable);
        };
    }

    return function(done) {
        exec("convert", function (error, stdout, stderr) {
            if (error || stderr) {
                // convert not available
                self.imageMagickConvertAvailable = false;
            } else {
                self.imageMagickConvertAvailable = true;
            }

            done(null, self.imageMagickConvertAvailable);
        });
    }
};


/**
 * Execute the "convert" command of ImageMagick
 *
 * @private
 * @param   {String} filePath - The file path
 * @param   {Array} [parameters] - The parameters
 * @param   {String} [newFilePath] - The file path of the converted image
 */
proto.imageMagickConvert = function(filePath, parameters, newFilePath)
{
    // Sanitize arguments
    // If the newFilePath is not provided, then overwrite the original image
    if (!parameters) {
        parameters = [];
    }
    if (!newFilePath) {
        newFilePath = filePath;
    }

    var exec = require('child_process').exec;
    var command = 'convert ' + parameters.join(' ') + ' "' + filePath + '" "' + newFilePath + '"';

    return function(done) {
        exec(command, function(error, stdout, stderr) {
            if (error) {
                throw error;
            }
            if (stderr) {
                throw new Error(stderr);
            }

            done(null, stdout);
        });
    };
};


module.exports = ImageManipulation;
