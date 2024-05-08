class Shumps extends Phaser.Scene {
    constructor() {
        super("shumpsScene");
        this.my = { sprite: {} };  // Create an object to hold sprite bindings

        // Create variables to hold constant values for sprite locations
        this.startX = game.config.width / 10;
        this.startY = game.config.height / 2;
        this.birdScale = 0.4;
        this.birdRotate = 90;

        this.my.sprite.bullet = [];
        this.my.sprite.enemyBullet = [];
        this.bulletScale = 0.2;
        this.bulletCooldown = 0;

        this.counter = 0; // For checking game ticks
        this.frequency = 120; // Frequency of enemy attacks in conjunction with counter
        this.enemyAggro = 10; // Decreases causing frequency of attacks when enemies get defeated
        this.maxEnemyBullets = 10;

        this.enemyStartX = game.config.width - 200;
        this.enemyStartY = game.config.height / 2;
        this.enemyScale = 0.4;
        this.my.sprite.enemyArray = [];

        this.liveScale = 0.3;
        this.numLives = 0;
        this.extraLifeCheckpoint = 0;
        this.livesCount = [];

        this.beePath = [];
        this.curve = [];

        this.level = 1;
        this.level_start = true;
        this.levelDelay = 0;
    }

    preload() {
    }

    create() {
        let my = this.my;   // create an alias to this.my for readability

        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        bg.setDisplaySize(this.game.config.width, this.game.config.height);

        if (!this.anims.exists('fly')) {
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

        // Create the main body sprite
        my.sprite.bird = this.add.sprite(this.startX, this.startY, "spriteSheet", "wingMan1.png");
        my.sprite.bird.anims.play('fly');
        my.sprite.bird.setScale(this.birdScale);

        // Enemy formations
        this.enemyFormations = {
            A: [
                this.enemyStartX, 210,
                this.enemyStartX, 390,
                this.enemyStartX - 80, 310,
                this.enemyStartX + 80, 310,

                this.enemyStartX + 80, 210,
                this.enemyStartX + 80, 390,
                this.enemyStartX - 80, 210,
                this.enemyStartX - 80, 390,

                this.enemyStartX, 130,
                this.enemyStartX, 310,
                this.enemyStartX - 160, 310,
                this.enemyStartX + 160, 310,
                this.enemyStartX, 490,
            ],
            B: [
                this.enemyStartX + 100, this.enemyStartY,
                this.enemyStartX + 100, this.enemyStartY + 70,
                this.enemyStartX + 100, this.enemyStartY + 140,
                this.enemyStartX + 100, this.enemyStartY - 70,
                this.enemyStartX + 100, this.enemyStartY - 140,
                this.enemyStartX, this.enemyStartY,
                this.enemyStartX, this.enemyStartY + 70,
                this.enemyStartX, this.enemyStartY + 140,
                this.enemyStartX, this.enemyStartY - 70,
                this.enemyStartX, this.enemyStartY - 140,
                this.enemyStartX + 50, this.enemyStartY,
                this.enemyStartX + 50, this.enemyStartY + 70,
                this.enemyStartX + 50, this.enemyStartY + 140,
                this.enemyStartX + 50, this.enemyStartY - 70,
                this.enemyStartX + 50, this.enemyStartY - 140,
            ],
            C: [
                this.enemyStartX, this.enemyStartY,
                this.enemyStartX, this.enemyStartY + 120,
                this.enemyStartX, this.enemyStartY - 120,
                this.enemyStartX - 130, this.enemyStartY,

                this.enemyStartX + 50, this.enemyStartY - 60,
                this.enemyStartX - 70, this.enemyStartY - 60,

                this.enemyStartX + 50, this.enemyStartY + 60,
                this.enemyStartX - 70, this.enemyStartY + 60,

                this.enemyStartX + 50, this.enemyStartY - 180,
                this.enemyStartX + 50, this.enemyStartY + 180,
            ]
        };

        this.enemyPaths = {
            A: [
                931, 280,
                723, 153,
                588, 249,
                654, 333,
                728, 262,
                643, 194,
                479, 202,
                421, 303,
                403, 409,
                343, 471,
                245, 446,
            ],
            B: [
                912, 302,
                671, 146,
                606, 463,
                447, 249,
                390, 426,
                273, 122,
                223, 262
            ],
            C: [
                899, 287,
                703, 422,
                432, 325,
                444, 153,
                591, 91,
                728, 122,
                780, 216,
                702, 319,
                603, 338,
                495, 370,
                427, 433,
                380, 523,
            ],
        };

        this.levelReset();
        this.generateEnemies();

        // Score Text
        this.playerScore = 0;
        this.scoreText = this.add.text(20, 20, 'Score: ' + Phaser.Utils.String.Pad(this.playerScore, 8, '0', 1), {
            fontFamily: 'cursive',
            fontSize: '32px',
            color: '#ffffff',  // Set text color
        });

        // Create intial lives
        for (let i = 0; i < 3; i++) {
            this.addLife();
        }
        this.add.text(20, game.config.height - 40, 'Lives: ', {
            fontFamily: 'cursive',
            fontSize: '24px',
            color: '#ffffff',  // Set text color
        });

        // Controls
        this.up = this.input.keyboard.addKey("W");
        this.upArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.input.keyboard.addKey("S");
        this.downArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.shoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.addLives = this.input.keyboard.addKey("L");

        document.getElementById('description').innerHTML = '<h2>Controls</h2><br>W / Up Arrow<br>S / Down Arrow<br>SPACE: Shoot';
        // Define key bindings

        this.playerSpeed = 5;
        this.bulletSpeed = 5;
        this.gamePause = false;
    }

    generateBeePath() {
        const formationKeys = Object.keys(this.enemyFormations);
        this.chosenPathType = formationKeys[Math.floor(Math.random() * formationKeys.length)];
        this.chooseFormation = this.enemyFormations[this.chosenPathType];

        // Loop through each enemy in the chosen formation
        for (let i = 0; i < this.chooseFormation.length; i += 2) {
            // Grab the X and Y coordinates of each Bee
            let beePosX = this.chooseFormation[i];
            let beePosY = this.chooseFormation[i + 1];

            // Create an array to be pushed into the new beePath, each corresponding to a bee
            let adjustedPath = [];

            // Select a random path for each enemy
            const pathKeys = Object.keys(this.enemyPaths);
            this.choosePath = this.enemyPaths[pathKeys[Math.floor(Math.random() * pathKeys.length)]];

            // Loop through each point in the formation
            for (let j = 0; j < this.choosePath.length; j += 2) {
                // Calculate the adjusted X and Y coordinates for the path                
                let adjustedX = this.choosePath[j] + (beePosX - this.choosePath[0]);
                let adjustedY = this.choosePath[j + 1] + (beePosY - this.choosePath[1]);

                // Push the adjusted coordinates into the adjusted path array
                adjustedPath.push(adjustedX);
                adjustedPath.push(adjustedY);
            }

            // Push the adjusted path into the beePath array
            this.beePath.push(adjustedPath);
        }
    }


    // Function to create enemies for the level
    generateEnemies() {
        let my = this.my;

        // Initialize the empty beePath array
        this.generateBeePath();

        // Create spline curve
        for (let path of this.beePath) {
            this.path = new Phaser.Curves.Spline(path);
            this.curve.push(this.path);
        }

        // Dependent on formation, which bees will be bosses
        let numOfBoss = 0;
        if (this.chosenPathType === 'A') {
            this.numOfBoss = 4;
        }
        else if (this.chosenPathType === 'B') {
            this.numOfBoss = 5;
        }
        else {
            this.numOfBoss = 4;
        }

        let posNum = 0;
        for (let i = 0; i < this.curve.length; i++) {
            if (i < this.numOfBoss) {
                let bossSprite = this.add.follower(this.curve[i], this.chooseFormation[posNum] + 500, this.chooseFormation[posNum + 1], "spriteSheet", "spikeMan_jump.png").setScale(this.enemyScale).play('bossFly');
                bossSprite.health = 2;
                bossSprite.score = 500;
                bossSprite.sound = 'boss';
                bossSprite.moving = false;
                my.sprite.enemyArray.push(bossSprite);
            }
            else {
                let beeSprite = this.add.follower(this.curve[i], this.chooseFormation[posNum] + 500, this.chooseFormation[posNum + 1], "spriteSheet", "flyMan_fly.png").setScale(this.enemyScale).play('beeFly');
                beeSprite.health = 1;
                beeSprite.score = 200;
                beeSprite.sound = 'bee';
                beeSprite.moving = false;
                my.sprite.enemyArray.push(beeSprite);
            }

            posNum += 2;
        }
    }

    levelReset() {
        let my = this.my;
        // Reset enemy aggro
        this.enemyAggro = 10;
        // Reset frequency of enemy attacks
        this.frequency = 120;
        // Reset level
        this.level = 1;

        this.levelDelay = 0;
        // Clear bullet arrays
        while (my.sprite.enemyBullet.length > 0) {
            my.sprite.enemyBullet.pop();
        }
        while (my.sprite.bullet.length > 0) {
            my.sprite.bullet.pop();
        }

        // Clear enemy array
        console.log('Before clearing enemyArray: ', my.sprite.enemyArray);
        for (let enemy of my.sprite.enemyArray) {
            my.sprite.enemyArray.pop();
            enemy.destroy();
        }
        console.log('After clearing enemyArray: ', my.sprite.enemyArray);

        // Clear beePath
        console.log('Before clearing beePath:', this.beePath);
        while (this.beePath.length > 0) {
            this.beePath.pop();
        }
        console.log('After clearing beePath:', this.beePath);

        // Empty spline curve
        console.log('Before clearing curve:', this.curve);
        while (this.curve.length > 0) {
            this.curve.pop();
        }
        console.log('After clearing curve:', this.curve);

    }

    // Create a single life
    addLife() {
        this.numLives++;
        let newLifeIndex = this.numLives - 1; // Get the index for the new life sprite
        let newLifeX = 120 + newLifeIndex * 60; // Calculate x position based on number of lives
        let newLifeSprite = this.add.sprite(newLifeX, game.config.height - 30, "spriteSheet", "wingMan1.png");
        newLifeSprite.setScale(this.liveScale);
        this.livesCount.push(newLifeSprite); // Add the new life sprite to the livesCount array
    }

    // Add a point to the spline
    addPoint(point) {
        this.curve.addPoint(point);
        this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
    }

    update() {
        let my = this.my;

        this.counter++;
        this.levelDelay++;

        // Player Movement
        if (this.up.isDown || this.upArrow.isDown) {
            if (my.sprite.bird.y > 100) {
                my.sprite.bird.y -= this.playerSpeed;
            }
        }
        if (this.down.isDown || this.downArrow.isDown) {
            if (my.sprite.bird.y < (game.config.height - 100)) {
                my.sprite.bird.y += this.playerSpeed;
            }
        }

        /*
        if (Phaser.Input.Keyboard.JustDown(this.addLives)) {
            console.log("Extra Life!");
            this.addLife();
        }
        */

        this.bulletCooldown--;
        // Check for bullet being fired
        if (this.shoot.isDown) {
            // Bullet cooldoown check
            if (this.bulletCooldown <= 0) {
                this.bulletCooldown = 50;
                let bullet = this.add.sprite(my.sprite.bird.x, my.sprite.bird.y, "spriteSheet", "cloud.png");
                bullet.setScale(this.bulletScale);
                my.sprite.bullet.push(bullet);
                this.sound.play('whoosh');
            }
        }

        if (this.levelDelay > 200) { // Delay start of the level for setup
            // Enemy begins movement
            if (this.counter > 200 && this.counter % this.frequency == 0 && my.sprite.enemyArray.length > 0) {
                // Filter out enemies that are already moving
                let stationaryEnemies = my.sprite.enemyArray.filter(enemy => enemy.moving === false);

                if (stationaryEnemies.length > 0) {
                    // Randomly pick one of the stationary enemies
                    this.enemy = stationaryEnemies[Math.floor(Math.random() * stationaryEnemies.length)];
                    this.whoMoves = Math.floor(Math.random() * (this.enemyAggro / 2)); // Randomized chance if enemy will even move

                    if (this.whoMoves == 0) {
                        this.enemy.moving = true;
                        this.enemy.startFollow({
                            from: 0,
                            to: 1,
                            delay: 0,
                            duration: 10000,
                            ease: 'Sine.easeInOut',
                            repeat: -1,
                            yoyo: true,
                        });
                    }
                }
            }
        }

        if (this.gamePause == false) {
            // Enemy bullets fired
            // Do this once every this.frequency calls to update() and if under the bulletThreshold
            if (this.counter > 200 && this.counter % this.frequency == 0 && my.sprite.enemyBullet.length < this.maxEnemyBullets) {
                this.whoAttacks = Math.floor(Math.random() * my.sprite.enemyArray.length)
                let enemyBullet = this.add.sprite(my.sprite.enemyArray[this.whoAttacks].x, my.sprite.enemyArray[this.whoAttacks].y, "enemyBullet");
                enemyBullet.setScale(this.bulletScale);
                enemyBullet.setAngle(90);
                my.sprite.enemyBullet.push(enemyBullet);
            }


            // Make all of the bullets move
            for (let bullet of my.sprite.bullet) {
                bullet.x += this.bulletSpeed;
            }
            for (let bullet of my.sprite.enemyBullet) {
                bullet.x -= this.bulletSpeed;
            }

            // Move enemies up for the first half and down for the second half of every 100 frame cycle
            if (this.counter % 5 === 0) {
                const direction = this.counter % 100 < 50 ? -1 : 1;  // Use -1 for up, 1 for down
                my.sprite.enemyArray.forEach(enemy => {
                    if (!enemy.moving) {
                        enemy.y += direction;  // Adjust position based on the direction
                    }
                });
            }
        }

        // Enemies enter the scene
        if (this.levelDelay < 160) {
            my.sprite.enemyArray.forEach(enemy => {
                if (!enemy.moving) {
                    enemy.x -= 3;  // Adjust position based on the direction
                }
            });
        }

        // Remove all of the bullets which are offscreen
        // filter() goes through all of the elements of the array, and
        // only returns those which **pass** the provided test (conditional)
        // In this case, the condition is, is the y value of the bullet
        // greater than zero minus half the display height of the bullet? 
        // (i.e., is the bullet fully offscreen to the top?)
        // We store the array returned from filter() back into the bullet
        // array, overwriting it. 
        // This does have the impact of re-creating the bullet array on every 
        // update() call. 
        // Filter bullets that are out of horizontal bounds and destroy them
        this.my.sprite.bullet = this.my.sprite.bullet.filter(bullet => {
            if (bullet.x <= 0 || bullet.x >= game.config.width + 20) {
                bullet.destroy();  // Properly destroy the sprite because they aren't being destroyed...
                return false;  // Remove from array
            }
            return true;  // Keep in array
        });

        this.my.sprite.enemyBullet = this.my.sprite.enemyBullet.filter(bullet => {
            if (bullet.x <= 0 || bullet.x >= game.config.width + 20) {
                bullet.destroy();  // Properly destroy the sprite because they aren't being destroyed...
                return false;  // Remove from array
            }
            return true;  // Keep in array
        });        

        if (this.gamePause == false) {
            // Check for collision with any bees
            for (let bullet of my.sprite.bullet) {
                for (let i = 0; i < my.sprite.enemyArray.length; i++) {
                    let bee = my.sprite.enemyArray[i];
                    if (this.collides(bee, bullet)) {
                        if (bee.health == 1) {
                            this.playerScore += bee.score;
                            bee.y += 1000;
                            bullet.y -= 1000
                            if (this.enemyAggro > 0) { this.enemyAggro--; }
                            this.scoreText.setText('Score: ' + Phaser.Utils.String.Pad(this.playerScore, 8, '0', 1));
                            bee.destroy(); // Remove the bee from the scene
                            my.sprite.enemyArray.splice(i, 1); // Remove the bee from the array
                            i--; // Decrement index since we removed an element
                        }
                        else {
                            bee.health--;
                        }

                        bullet.x = -500;
                        if (bee.sound == 'boss') {
                            this.sound.play('bossHit');
                        }
                        else {
                            this.sound.play('beeHit');
                        }

                        break;
                    }
                }
            }
        }

        // Check if score has crossed a new multiple of 50000
        if (this.playerScore >= this.extraLifeCheckpoint + 50000) {
            this.addLife();
            this.extraLifeCheckpoint += 50000; // Update the checkpoint to the next multiple
        }

        if (this.gamePause == false) {
            // Check for collision with the player
            for (let bullet of my.sprite.enemyBullet) {
                if (this.collides(my.sprite.bird, bullet)) {
                    bullet.x = -100;
                    this.sound.play('playerHit');
                    if (this.numLives > 0) {
                        this.livesCount[this.numLives - 1].visible = false;
                        this.livesCount.pop();
                        this.numLives--;
                    }
                }
            }
        }

        // Game Over Trigger
        if (this.numLives == 0 && this.gamePause == false) {
            // Remove all bullets before starting a new game
            this.gamePause = true;
            this.scene.get('gameOver').data.set('playerScore', this.playerScore);
            this.scene.get('audio').stopMusic('backgroundMusic');

            // Pause all enemies
            my.sprite.enemyArray.forEach(enemy => {
                enemy.active = false;
            });

            // Delayed call to make the bird fall
            this.time.delayedCall(800, () => {
                // Tween to make the bird fall
                my.sprite.bird.setAngle(180);
                this.tweens.add({
                    targets: my.sprite.bird,
                    y: this.game.config.height + 200,  // Adjust target y to be off the screen
                    duration: 1200,  // Duration of the fall in milliseconds
                });
            });

            this.time.delayedCall(2500, () => {
                this.scene.start("gameOver");
            });
        }

        // Check for any enemies remaining on screen to increase level
        if (my.sprite.enemyArray.length == 0) {
            // Create a new set of enemies
            this.generateEnemies();
            // Reset enemy aggresion
            this.enemyAggro = 10;
            // Increase frequency of enemy attacks
            if (this.frequency > 0) { this.frequency -= 10; }

            // Increase level
            this.level++;
            // Create delay in level start
            this.level_start = false;
            this.levelDelay = 0;
            this.time.delayedCall(500, () => this.level_start = true); // Create delay in next level

            console.log("Level Up!: ", this.level);
            // Display next text "Level X"
        }
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }
}