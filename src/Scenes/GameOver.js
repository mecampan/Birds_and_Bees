class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOver");
        this.my = { sprite: {} };  // Create an object to hold sprite bindings

        this.my.sprite.beeFly = [];
        this.my.sprite.bossFly = [];

        this.counter = 0;
    }

    preload() {
    }

    create() {
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        let gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'GAME OVER', {
            fontFamily: 'cursive',
            fontSize: '64px',
            color: '#ffffff',  // Set text color
            align: 'center'  // Align text in the center
        }).setOrigin(0.5);

        let playerScore = this.data.get('playerScore') || 0;
        console.log(playerScore); // Check what value it holds, should not be undefined

        // Retrieve high score from local storage or set to 0 if not found
        let highScore = parseInt(localStorage.getItem('highScore')) || 0;
        console.log(highScore); // Check what value it holds, should not be undefined

        // Check if the current score is greater than the high score
        if (playerScore > highScore) {
            highScore = playerScore;
            localStorage.setItem('highScore', highScore.toString());
        }

        let scoreText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Score: ' + Phaser.Utils.String.Pad(playerScore, 8, '0', 1), {
            fontFamily: 'cursive',
            fontSize: '32px',
            color: '#ffffff',  // Set text color
            align: 'center'  // Align text in the center
        }).setOrigin(0.5);

        let highScoreText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 200, 'High Score: ' + Phaser.Utils.String.Pad(highScore, 8, '0', 1), {
            fontFamily: 'cursive',
            fontSize: '32px',
            color: '#ffffff',  // Set text color
            align: 'center'  // Align text in the center
        }).setOrigin(0.5);
        
        let playAgain = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200, 'Press [ENTER] to play again.', {
            fontFamily: 'cursive',
            fontSize: '32px',
            color: '#ffffff',  // Set text color
            align: 'center'  // Align text in the center
        }).setOrigin(0.5);

        let again = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        again.on('down', () => {
            for (let bee of this.my.sprite.beeFly) {
                bee.destroy();
            }

            for (let boss of this.my.sprite.bossFly) {
                boss.destroy();
            }

            this.scene.get('audio').playMusic('backgroundMusic');
            this.scene.start("shumpsScene");
        });
    }

    update() {
        this.counter++;

        if (this.counter % 50 == 0) {
            let bossSprite = this.add.sprite(game.config.width + 50, 200, "spriteSheet", "spikeMan_jump.png").setScale(0.4).play('bossFly');
            this.my.sprite.bossFly.push(bossSprite);
            let beeSprite = this.add.sprite(-50, game.config.height - 180, "spriteSheet", "flyMan_fly.png").setScale(0.4).play('beeFly');
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