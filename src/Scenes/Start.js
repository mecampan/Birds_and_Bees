class Start extends Phaser.Scene {
    constructor() {
        super("start");
        this.my = { sprite: {} };  // Create an object to hold sprite bindings

        this.my.sprite.beeFly = [];
        this.my.sprite.bossFly = [];

        this.counter = 0;
    }

    preload() {
        // Assets from Kenny Assets pack "Jumper Pack"
        // https://kenney.nl/assets/jumper-pack
        this.load.setPath("./assets/");

        // Load sprite atlas
        this.load.atlasXML("spriteSheet", "spritesheet_jumper.png", "spritesheet_jumper.xml");
        this.load.image('background', 'forest.jpg');
        this.load.image('enemyBullet', 'spike_bottom.png');
    }

    create() {
        let my = this.my;   // create an alias to this.my for readability
        this.scene.get('audio').playMusic('backgroundMusic');

        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        let highScore = parseInt(localStorage.getItem('highScore')) || 0;
        let highScoreText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 200, 'High Score: ' + Phaser.Utils.String.Pad(highScore, 8, '0', 1), {
            fontFamily: 'cursive',
            fontSize: '32px',
            color: '#ffffff',  // Set text color
            align: 'center'  // Align text in the center
        }).setOrigin(0.5);

        let titleText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'The Bird and the Bees', {
            fontFamily: 'cursive',
            fontSize: '64px',
            color: '#ffffff',  // Set text color
            align: 'center'  // Align text in the center
        }).setOrigin(0.5);

        // Create a tween for the text
        this.tweens.add({
            targets: titleText, // the text object itself
            scaleX: 1.2, // scale horizontally by a factor of 2
            scaleY: 1.2, // scale vertically by a factor of 2
            yoyo: true, // make it go back to original scale
            repeat: -1, // repeat indefinitely
            ease: 'Sine.easeInOut', // easing function for smooth animation
            duration: 1000 // duration of one cycle of scaling up and down
        });

        let startText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200, 'Press [ENTER] to begin', {
            fontFamily: 'cursive',
            fontSize: '32px',
            color: '#ffffff',  // Set text color
            align: 'center'  // Align text in the center
        }).setOrigin(0.5);        

        let startGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        startGame.on('down', (key, event) => {
            this.scene.start("shumpsScene") 
            this.bird.destroy();
            this.bird2.destroy();
            this.bird3.destroy();
            this.bird4.destroy();

            for (let bee of this.my.sprite.beeFly) {
                bee.destroy();
            }

            for (let boss of this.my.sprite.bossFly) {
                boss.destroy();
            }
        })

        this.anims.create({
            key: 'fly',
            frames: [
                { key: "spriteSheet", frame: "wingMan1.png" },
                { key: "spriteSheet", frame: "wingMan2.png" },
                { key: "spriteSheet", frame: "wingMan3.png" },
                { key: "spriteSheet", frame: "wingMan4.png" },
                { key: "spriteSheet", frame: "wingMan5.png" },
                { key: "spriteSheet", frame: "wingMan4.png" },
                { key: "spriteSheet", frame: "wingMan3.png" },
                { key: "spriteSheet", frame: "wingMan2.png" }
            ],
            frameRate: 10,
            repeat: -1
        });

        // Create the main body sprite
        this.bird = this.add.sprite(50, 50, "spriteSheet", "wingMan1.png");
        this.bird.anims.play('fly');
        this.bird.setScale(0.4);
        
        this.bird2 = this.add.sprite(game.config.width - 50, 50, "spriteSheet", "wingMan1.png");
        this.bird2.anims.play('fly');
        this.bird2.setScale(0.4);   
        
        this.bird3 = this.add.sprite(50 , game.config.height - 50, "spriteSheet", "wingMan1.png");
        this.bird3.anims.play('fly');
        this.bird3.setScale(0.4);   

        this.bird4 = this.add.sprite(game.config.width - 50, game.config.height - 50, "spriteSheet", "wingMan1.png");
        this.bird4.anims.play('fly');
        this.bird4.setScale(0.4);   

        // Enemy sprite animations
        
        this.anims.create({
            key: 'beeFly',
            frames: [
                { key: "spriteSheet", frame: "flyMan_fly.png" },
                { key: "spriteSheet", frame: "flyMan_stand.png" },
                { key: "spriteSheet", frame: "flyMan_jump.png" },
                { key: "spriteSheet", frame: "flyMan_stand.png" },
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'bossFly',
            frames: [
                { key: "spriteSheet", frame: "spikeMan_jump.png" },
                { key: "spriteSheet", frame: "spikeMan_stand.png" },
            ],
            frameRate: 3,
            repeat: -1
        });
    }

    update() {
        this.counter++;

        if (this.counter % 50 == 0) {
            let bossSprite = this.add.sprite(game.config.width + 50, 200, "spriteSheet", "spikeMan_jump.png").setScale(0.4).play('bossFly');
            this.my.sprite.bossFly.push(bossSprite);
            let beeSprite = this.add.sprite(-50, game.config.height - 200, "spriteSheet", "flyMan_fly.png").setScale(0.4).play('beeFly');
            this.my.sprite.beeFly.push(beeSprite);   
        }

        // Make all of the bullets and powerUps move
        for (let bee of this.my.sprite.bossFly) {
            bee.x -= 3;
        }
        for (let bee of this.my.sprite.beeFly) {
            bee.x += 3;
        }

        this.my.sprite.bossFly = this.my.sprite.bossFly.filter(boss => {
            if (boss.x <= -20) {
                boss.destroy();  // Properly destroy the sprite because they aren't being destroyed...
                return false;  // Remove from array
            }
            return true;  // Keep in array
        });
        
        this.my.sprite.beeFly = this.my.sprite.beeFly.filter(bee => {
            if (bee.x > game.config.width + 20) {
                bee.destroy();  // Properly destroy the sprite because they aren't being destroyed...
                return false;  // Remove from array
            }
            return true;  // Keep in array
        });        
    }
}