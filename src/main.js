// Michael Campanile
// Created: 5/3/2024
// Phaser: 3.70.0
//
// The Birds and the Bees
//
// Gallery shooter assignment for CMPM 120
// 
// Art assets from Kenny Assets "Jumper Pack" set:
// https://kenney.nl/assets/jumper-pack

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: false  // prevent pixel art from getting blurred when scaled
    },
    width: 1000,
    height: 600,
    scene: [Audio, Start, Shumps, GameOver],
    fps: { forceSetTimeOut: true, target: 60 },
    highScore: 0
}

const game = new Phaser.Game(config);