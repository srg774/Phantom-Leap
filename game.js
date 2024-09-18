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
    const tempoIncreaseFactor = 0.1; // Rate at which tempo increases with game speed

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
                endMessage = "Ooh, spooky!";
            } else if (souls < 300) {
                endMessage = "Well done!";
            } else {
                endMessage = "You are a ghost master!";
            }

            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.font = '50px Creepster';
            ctx.textAlign = 'center';

            // Apply red glow effect
            ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
            ctx.shadowBlur = 15;

            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 60);

            // Display the end message based on the souls count
            ctx.font = '20px Creepster';
            ctx.fillText(endMessage, canvas.width / 2, canvas.height / 2 - 20);

            // Display the souls count
            ctx.fillText('Souls: ' + souls, canvas.width / 2, canvas.height / 2 + 20);

            // Display the new text "By S.Gilchrist 2024 CC-BY-NC 4.0"
            ctx.font = '16px Creepster';
            ctx.fillText('By S.Gilchrist 2024 CC-BY-NC 4.0', canvas.width / 2, canvas.height / 2 + 60);

            restartButton.style.display = 'block';

            // Reset shadow for other drawings
            ctx.shadowColor = 'transparent';

            // Stop the background music
            themeMusic.pause();
            themeMusic.currentTime = 0;

            return;
        }

        playerVelocityY += gravity;
        if (playerVelocityY > maxSpeed) playerVelocityY = maxSpeed;

        playerY += playerVelocityY;
        playerX += playerVelocityX;

        if (playerX < 0) playerX = 0;
        if (playerX + playerWidth > canvas.width) playerX = canvas.width - playerWidth;
        if (playerY < 0) playerY = 0;

        if (playerVelocityY < 0) {
            currentPlayerImage = playerImageJump;
        } else if (playerVelocityX < 0) {
            currentPlayerImage = playerImageLeft;
        } else if (playerVelocityX > 0) {
            currentPlayerImage = playerImageRight;
        } else {
            currentPlayerImage = playerImageRight;
        }

        checkBlockCollision();
        checkGameOver();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawStars();
        drawPlayer();
        drawBlocks();
        drawGhost();

        if (timestamp - lastBlockGenerationTime > blockGenerationInterval) {
            generateBlock();
            lastBlockGenerationTime = timestamp;
        }

        // Update the playback rate of the theme music
        themeMusic.playbackRate = baseTempo + (gameSpeed / maxSpeed) * tempoIncreaseFactor;

        // Draw the current souls count
        ctx.fillStyle = 'red';
        ctx.font = '20px Creepster';
        ctx.textAlign = 'left';

        // Apply green glow effect
        ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        ctx.shadowBlur = 15;

        ctx.fillText('Souls: ' + souls, 10, 30);

        // Reset shadow for other drawings
        ctx.shadowColor = 'transparent';

        requestAnimationFrame(gameLoop);
    }

    function initializeStars() {
        starData = [];
        const numberOfStars = 7;
        for (let i = 0; i < numberOfStars; i++) {
            starData.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                opacity: Math.random(),
                fadeSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        starData.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);

            star.opacity += star.fadeSpeed;
            if (star.opacity > 1 || star.opacity < 0) {
                star.fadeSpeed *= -1;
            }
        });
    }

    function drawPlayer() {
        ctx.drawImage(currentPlayerImage, playerX, playerY, playerWidth, playerHeight);
    }

    function drawBlocks() {
        blocks.forEach(block => {
            block.y += gameSpeed;

            const boneWidth = blockWidth * 1.00;
            const boneHeight = blockHeight * 2.40;

            if (block.hit) {
                ctx.drawImage(selectedBoneImage, block.x, block.y, boneWidth, boneHeight);
            } else {
                ctx.drawImage(boneImage, block.x, block.y, boneWidth, boneHeight);
            }
        });
    }

    function drawGhost() {
        if (ghostObject) {
            ctx.drawImage(ghostImage, ghostObject.x, ghostObject.y, ghostObject.size, ghostObject.size);
            ghostObject.x += ghostObject.dx;
            ghostObject.y += ghostObject.dy;

            if (
                ghostObject.x + ghostObject.size <= 0 ||
                ghostObject.x >= canvas.width ||
                ghostObject.y + ghostObject.size <= 0 ||
                ghostObject.y >= canvas.height
            ) {
                souls++;
                ghostSound.currentTime = 0; // Ensure the sound starts from the beginning
                ghostSound.play(); // Play ghost sound
                ghostObject = null;
            }
        }
    }

    restartButton.addEventListener('click', () => {
        resetGame();
        startGame();
    });
};
