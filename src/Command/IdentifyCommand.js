/* @flow */
import {exec} from "child_process"

// Private methods
const imageMagickIdentifyCheck = Symbol();
const imageMagickIdentify = Symbol();


/**
 * Identify command
 */
export default class IdentifyCommand
{
    /**
     * Indicates that the identify command is available
     */
    imageMagickIdentifyAvailable:boolean;

    /**
     * Get command name
     *
     * @return  {string}    Command name
     */
    getName():string
    {
        return "identify";
    }

    /**
     * Get command description
     *
     * @return  {string}    Command description
     */
    getDescription():string
    {
        return "Display informations about an image";
    }

    /**
     * Display informations about an image
     *
     * @param   {Array}     parameters  Parameters
     * @param   {Array}     options     Options
     */
    *execute(parameters:Array<string>, options:Array<string>):*
    {
        if (parameters.length < 1) {
            throw new Error("Please provide image path");
        }
        let imagePath = parameters[0];


        // $FlowFixMe
        let commandAvailable = yield this[imageMagickIdentifyCheck]();
        if (!commandAvailable) {
            console.error('Command "identify" is not available, please install ImageMagick');
            return;
        }

        // $FlowFixMe
        let informations = yield this[imageMagickIdentify](imagePath);

        console.log(informations);
    }

    /**
     * Check if the "identify" command of ImageMagick is available
     *
     * @private
     * @return  {Boolean} true if the command is available, false otherwise
     */
    // $FlowFixMe
    [imageMagickIdentifyCheck]():*
    {
        let self = this;

        if (self.imageMagickIdentifyAvailable !== undefined) {
            return (done) => {
                done(null, self.imageMagickIdentifyAvailable);
            };
        }

        return (done) => {
            exec("hash identify", (error, stdout, stderr) => {
                if (error || stderr) {
                    // identify not available
                    self.imageMagickIdentifyAvailable = false;
                } else {
                    self.imageMagickIdentifyAvailable = true;
                }

                done(null, self.imageMagickIdentifyAvailable);
            });
        }
    }

    /**
     * Execute the "identify" command of ImageMagick
     *
     * @private
     * @param   {string} filePath   File path
     * @return  {object}            File informations
     */
    // $FlowFixMe
    [imageMagickIdentify](filePath:string):*
    {
        let command = 'identify -format "%m %z %w %h %b %f" "' + filePath + '"';

        return (done) => {
            exec(command, (error, stdout, stderr) => {
               if (stderr.match(/^identify:/)) {
                    done(new Error('Unsupported image'));
                } else {
                    let temp = stdout.replace('PixelsPerInch', '').split(' ');

                    if (temp.length < 6) {
                        done(new Error('Unsupported image'));
                    } else {
                        let info     = {};
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
    }
}
