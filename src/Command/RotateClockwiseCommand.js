/* @flow */
import {exec} from "child_process"

// Private methods
const imageMagickConvertCheck = Symbol();
const imageMagickConvert = Symbol();


/**
 * Rotate clockwise command
 */
export default class RotateClockwiseCommand
{
    /**
     * Indicates that the convert command is available
     */
    imageMagickConvertAvailable:boolean;

    /**
     * Get command name
     *
     * @return  {string}    Command name
     */
    getName():string
    {
        return "rotateClockwise";
    }

    /**
     * Get command description
     *
     * @return  {string}    Command description
     */
    getDescription():string
    {
        return "Rotate an image 90° clockwise";
    }

    /**
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
        let commandAvailable = yield this[imageMagickConvertCheck]();
        if (!commandAvailable) {
            console.error('Command "convert" is not available, please install ImageMagick');
            return;
        }

        // $FlowFixMe
        var result = yield this[imageMagickConvert](imagePath, ['-rotate 90']);

        console.log('Done');
    }

    /**
     * Check if the "convert" command of ImageMagick is available
     *
     * @private
     * @return  {Boolean} true if the command is available, false otherwise
     */
    // $FlowFixMe
    [imageMagickConvertCheck]():*
    {
        let self = this;

        if (self.imageMagickConvertAvailable !== undefined) {
            return (done) => {
                done(null, self.imageMagickConvertAvailable);
            };
        }

        return (done) => {
            exec("hash convert", (error, stdout, stderr) => {
                if (error || stderr) {
                    // Command not available
                    self.imageMagickConvertAvailable = false;
                } else {
                    self.imageMagickConvertAvailable = true;
                }

                done(null, self.imageMagickConvertAvailable);
            });
        }
    }

    /**
     * Execute the "convert" command of ImageMagick
     *
     * @private
     * @param   {string}    filePath    File path
     * @param   {Array}     parameters  Parameters
     * @param   {string}    newFilePath New file path
     */
    // $FlowFixMe
    [imageMagickConvert](filePath:string, parameters?:Array<string>, newFilePath?:string):*
    {
        // Sanitize arguments
        // If the newFilePath is not provided, then overwrite the original image
        if (!parameters) {
            parameters = [];
        }
        if (!newFilePath) {
            newFilePath = filePath;
        }

        let command = 'convert ' + parameters.join(' ') + ' "' + filePath + '" "' + newFilePath + '"';

        return (done) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                if (stderr) {
                    throw new Error(stderr);
                }

                done(null, stdout);
            });
        }
    }
}
