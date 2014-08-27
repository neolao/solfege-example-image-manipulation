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
 * Check if the "identify" command of ImageMagick is available
 *
 * @return  {Boolean} true if the command is available, false otherwise
 */
proto.imageMagickIdentifyCheck = function()
{
    var self = this;
    var exec = require('child_process').exec;

    if (self.imageMagickIdentifyAvailable !== undefined) {
        return function(done) {
            done(null, true);
        };
    }

    return function(done) {
        exec("identify", function (error, stdout, stderr) {
            if (error || stderr) {
                // identify not available
                self.imageMagickIdentifyAvailable = false;
                done(null, false);
                return;
            }

            self.imageMagickIdentifyAvailable = true;
            done(null, true);
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


module.exports = ImageManipulation;
