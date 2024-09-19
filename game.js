window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const restartButton = document.getElementById('restartButton');

    canvas.width = 400;
    canvas.height = 600;

    let isGameOver = false;
    let gameSpeed = 0.5;
    let score = 0;
    let souls = 0;
    let gravity = 0.2;
    let playerVelocityY = 0;
    let playerVelocityX = 0;

    const playerWidth = 30;
    const playerHeight = 30;
    const playerSpeed = 2;
    const jumpStrength = 4;
    const maxSpeed = 5;
    let playerX, playerY;

    const playerImageRight = new Image();
    playerImageRight.src = 'assets/spriteR.png';
    const playerImageLeft = new Image();
    playerImageLeft.src = 'assets/spriteL.png';
    const playerImageJump = new Image();
    playerImageJump.src = 'assets/spriteJump.png';
    let currentPlayerImage = playerImageRight;

    const boneImage = new Image();
    boneImage.src = 'assets/spritebone.png';
    const selectedBoneImage = new Image();
    selectedBoneImage.src = 'assets/spriteselectbone.png';

    const ghostImage = new Image();
    ghostImage.src = 'assets/spriteghost.png';

    const themeMusic = new Audio('assets/theme.mp3');
    themeMusic.loop = true;
    themeMusic.volume = 0.2; // Start with a lower volume

    const introMusic = new Audio('assets/intro.mp3');
    introMusic.volume = 0.5; // Volume for the intro music

    const jumpSound = new Audio('assets/jump.ogg');
    const ghostSound = new Audio('assets/ghost.ogg');
    const dieSound = new Audio('assets/die.ogg');
    const readySound = new Audio('assets/ready.ogg');
    const goSound = new Audio('assets/go.ogg');
    const endMusic = new Audio('assets/end.mp3');

    const blocks = [];
    const blockWidth = 50;
    const blockHeight = 15;
    const blockSpacing = 200;

    let imagesLoaded = 0;
    playerImageRight.onload = playerImageLeft.onload = playerImageJump.onload = boneImage.onload = selectedBoneImage.onload = ghostImage.onload = function() {
        imagesLoaded++;
        if (imagesLoaded === 6) {
            startGame();
        }
    };

    const baseTempo = 1.0; // Base tempo for the music
    const tempoIncreaseFactor = 1.0; // Maximum tempo increase factor over 10 minutes
    let themeMusicStartTime = null;

    function startGame() {
        initializeStars();
        showReadyScreen();
    }

    function showReadyScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '40px Creepster';
        ctx.textAlign = 'center';

        // Apply green glow effect
        ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        ctx.shadowBlur = 15;

        ctx.fillText('Ready', canvas.width / 2, canvas.height / 2);

        // Reset shadow for other drawings
        ctx.shadowColor = 'transparent';

        readySound.play(); // Play ready sound
        setTimeout(() => {
            showGoScreen();
        }, 2000);
    }

    function showGoScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '40px Creepster';
        ctx.textAlign = 'center';

        // Apply green glow effect
        ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        ctx.shadowBlur = 15;

        ctx.fillText('Go', canvas.width / 2, canvas.height / 2);

        goSound.play(); // Play go sound
        setTimeout(() => {
            resetGame();
            introMusic.pause(); // Stop intro music
            introMusic.currentTime = 0; // Reset intro music position
            themeMusic.play(); // Start theme music
            themeMusicStartTime = performance.now(); // Initialize theme music start time
            requestAnimationFrame(gameLoop);
        }, 1000);

        // Reset shadow for other drawings
        ctx.shadowColor = 'transparent';
    }

    function resetGame() {
        isGameOver = false;
        gameSpeed = 0.5;
        score = 0;
        souls = 0;
        playerX = canvas.width / 2 - playerWidth / 2;
        playerY = canvas.height / 2 - playerHeight / 2;
        playerVelocityY = 0;
        playerVelocityX = 0;
        blocks.length = 0;
        ghostObject = null;
        generateInitialBlocks();
        restartButton.style.display = 'none';
    }

    function generateInitialBlocks() {
        for (let i = 0; i < 5; i++) {
            generateBlock(canvas.height - i * blockSpacing);
        }
    }

    function generateBlock() {
        if (blocks.length === 0 || blocks[blocks.length - 1].y > blockSpacing) {
            const block = {
                x: Math.random() * (canvas.width - blockWidth),
                y: -blockHeight,
                width: blockWidth,
                height: blockHeight,
                hit: false,
                missed: false
            };
            blocks.push(block);
        }
    }

    let jumpRequested = false;

    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            playerVelocityX = -playerSpeed;
            currentPlayerImage = playerImageLeft;
        } else if (event.key === 'ArrowRight') {
            playerVelocityX = playerSpeed;
            currentPlayerImage = playerImageRight;
        } else if (event.key === 'ArrowUp' || event.key === ' ') { 
            if (!jumpRequested) {
                jump();
                jumpRequested = true;
                currentPlayerImage = playerImageJump;
                jumpSound.play(); // Play jump sound on every jump
            }
        }
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            playerVelocityX = 0;
        } else if (event.key === 'ArrowUp' || event.key === ' ') {
            jumpRequested = false;
        }
    });

    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch.clientX < canvas.width / 2) {
            playerVelocityX = -playerSpeed;
            currentPlayerImage = playerImageLeft;
        } else {
            playerVelocityX = playerSpeed;
            currentPlayerImage = playerImageRight;
        }
        if (!jumpRequested) {
            jump();
            jumpRequested = true;
            currentPlayerImage = playerImageJump;
            jumpSound.play(); // Play jump sound on every jump
        }
    });

    canvas.addEventListener('touchend', function(e) {
        playerVelocityX = 0;
        jumpRequested = false;
    });

    function jump() {
        playerVelocityY = -jumpStrength;
    }

    let ghostObject = null; // Single ghost object

    function checkBlockCollision() {
        blocks.forEach(block => {
            if (
                playerX + playerWidth > block.x &&
                playerX < block.x + blockWidth &&
                playerY + playerHeight > block.y &&
                playerY < block.y + blockHeight
            ) {
                playerVelocityY = -jumpStrength;
                playerY = block.y - playerHeight;
                block.hit = true;
                score += 1;

                if (gameSpeed < maxSpeed) {
                    gameSpeed += 0.01;
                    // Increase theme music volume proportionally to game speed
                    themeMusic.volume = Math.min(0.5, 0.2 + (gameSpeed / maxSpeed) * 0.3);
                }

                if (!ghostObject) {
                    const direction = Math.random() < 0.5 ? -1 : 1;
                    ghostObject = {
                        x: playerX + playerWidth / 2 - 15,
                        y: playerY,
                        size: 30,
                        speed: 2,
                        dx: direction * 2,
                        dy: -2
                    };
                }
            }
        });
    }

    function checkGameOver() {
        if (playerY > canvas.height) {
            isGameOver = true;
        }

        blocks.forEach(block => {
            if (block.y > canvas.height && !block.hit) {
                block.missed = true;
                isGameOver = true;
            }
        });
    }

    const blockGenerationInterval = 1000;
    let lastBlockGenerationTime = 0;

    function gameLoop(timestamp) {
        if (isGameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            endMusic.play(); // Play end music

            // Determine the message based on the souls count
            let endMessage;
            if (souls < 100) {
                endMessage = "Ghosts took your soul. Try again!";
            } else if (souls < 200) {
                endMessage = "Almost there! Ghosts nearly caught you!";
            } else {
                endMessage = "Congratulations! You escaped the ghosts!";
            }

            ctx.fillStyle = 'red';
            ctx.font = '40px Creepster';
            ctx.textAlign = 'center';
            ctx.fillText(endMessage, canvas.width / 2, canvas.height / 2);
            restartButton.style.display = 'block';
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update player position
        playerY += playerVelocityY;
        playerX += playerVelocityX;
        playerVelocityY += gravity;

        // Update blocks
        blocks.forEach(block => {
            block.y += gameSpeed;
        });

        // Remove off-screen blocks
        blocks.forEach((block, index) => {
            if (block.y > canvas.height) {
                if (!block.missed) {
                    souls++;
                }
                blocks.splice(index, 1);
            }
        });

        // Check block collision
        checkBlockCollision();
        // Check game over
        checkGameOver();

        // Draw blocks
        blocks.forEach(block => {
            ctx.fillStyle = 'grey';
            ctx.fillRect(block.x, block.y, block.width, block.height);
        });

        // Draw player
        ctx.drawImage(currentPlayerImage, playerX, playerY, playerWidth, playerHeight);

        // Draw ghost if present
        if (ghostObject) {
            ghostObject.x += ghostObject.dx;
            ghostObject.y += ghostObject.dy;

            if (ghostObject.x < 0 || ghostObject.x + ghostObject.size > canvas.width) {
                ghostObject.dx *= -1;
            }

            if (ghostObject.y < 0 || ghostObject.y + ghostObject.size > canvas.height) {
                ghostObject.dy *= -1;
            }

            ctx.drawImage(ghostImage, ghostObject.x, ghostObject.y, ghostObject.size, ghostObject.size);

            // Check collision with ghost
            if (
                playerX + playerWidth > ghostObject.x &&
                playerX < ghostObject.x + ghostObject.size &&
                playerY + playerHeight > ghostObject.y &&
                playerY < ghostObject.y + ghostObject.size
            ) {
                isGameOver = true;
                ghostSound.play(); // Play ghost sound on collision
            }
        }

        // Update score display
        ctx.fillStyle = 'white';
        ctx.font = '20px Creepster';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 10, 30);
        ctx.fillText('Souls: ' + souls, 10, 60);

        // Schedule the next frame
        requestAnimationFrame(gameLoop);

        // Generate blocks
        if (timestamp - lastBlockGenerationTime > blockGenerationInterval) {
            generateBlock();
            lastBlockGenerationTime = timestamp;
        }

        // Adjust tempo of the music
        if (themeMusicStartTime) {
            const elapsedTime = (performance.now() - themeMusicStartTime) / 60000; // Convert to minutes
            const tempoFactor = 1 + Math.min(elapsedTime / 10, tempoIncreaseFactor);
            themeMusic.playbackRate = baseTempo * tempoFactor;
        }
    }

    // Restart button event listener
    restartButton.addEventListener('click', function() {
        resetGame();
        requestAnimationFrame(gameLoop);
    });

    // Start with the intro music
    introMusic.play();
};
