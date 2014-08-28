module.exports = {

    // Command line interface
    // Used by the bundle solfege.bundle.cli
    cli: {
        // Display informations about an image
        identify: {
            description: 'Display informations about an image',
            method: 'identify'
        },

        // Rotate an image 90° clockwise
        rotateClockwise: {
            description: 'Rotate an image 90° clockwise',
            method: 'rotateClockwise'
        },

        // Rotate an image 90° counter clockwise
        rotateCounterClockwise: {
            description: 'Rotate an image 90° counter clockwise',
            method: 'rotateCounterClockwise'
        }
    }
};
