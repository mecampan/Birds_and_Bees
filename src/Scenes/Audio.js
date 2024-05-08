class Audio extends Phaser.Scene {
    constructor() {
        super('audio');
    }

    preload() {
        this.load.setPath("./assets/");
    
        // Music Attribution:
        // "Overworld" Kevin MacLeod (incompetech.com)
        // Licensed under Creative Commons: By Attribution 4.0 License
        // http://creativecommons.org/licenses/by/4.0/     
        this.load.audio('backgroundMusic', 'overworld.ogg');

        // Sound Assets from Kenny Assets pack "Interface Sounds"
        // https://kenney.nl/assets/interface-sounds
        this.load.audio('playerHit', 'minimize_002.ogg');
        this.load.audio('playerPower', 'maximize_002.ogg');

        // BUMBLEBEE.wav by Robak1974 -- 
        // https://freesound.org/s/512663/ -- 
        // License: Creative Commons 0
        this.load.audio('beeHit', 'bumblebee_fast.ogg');
        this.load.audio('bossHit', 'bumblebee_low.ogg');

        // Whoosh Bamboo 2 by Sadiquecat -- 
        // https://freesound.org/s/706677/ -- 
        // License: Creative Commons 0
        this.load.audio('whoosh', 'whoosh_bamboo.ogg');

        // Game over sounds 1 by afleetingspeck -- 
        // https://freesound.org/s/232444/ -- 
        // License: Creative Commons 0
        this.load.audio('gameOver_sfx', 'game_over.ogg');

    }

    create() {
        // Initialize your sounds here
        this.sounds = {
            backgroundMusic: this.sound.add('backgroundMusic', { loop: true }),
            playerHit: this.sound.add('playerHit'),
            playerPower: this.sound.add('playerPower'),
            beeHit: this.sound.add('beeHit'),
            bossHit: this.sound.add('bossHit'),
            whoosh: this.sound.add('whoosh'),
            gameOver_sfx: this.sound.add('gameOver_sfx')
        };
    }

    playMusic(key) {
        if (this.sounds[key] && !this.sounds[key].isPlaying) {
            this.sounds[key].play();
        }
    }

    stopMusic(key) {
        if (this.sounds[key] && this.sounds[key].isPlaying) {
            this.sounds[key].stop();
        }
    }

    playSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].play();
        }
    }

    update() {
        this.scene.start("start");
    }
}
