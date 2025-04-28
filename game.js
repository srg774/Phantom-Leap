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
    themeMusic.volume = 0.2;

    const introMusic = new Audio('assets/intro.mp3');
    introMusic.volume = 0.5;

    const jumpSound = new Audio('assets/jump.ogg');
    const ghostSound = new Audio('assets/ghost.ogg');
    const dieSound = new Audio('assets/die.ogg');
    const readySound = new Audio('assets/ready.ogg');
    const goSound = new Audio('assets/go.ogg');
    const endMusic = new Audio('assets/end.mp3');

    // Unlock audio on first user interaction
    function unlockAudio() {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);

        introMusic.play().catch(() => {});
        themeMusic.play().catch(() => {});
    }
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    const blocks = [];
    const blockWidth = 50;
    const blockHeight = 15;
    const blockSpacing = 200;

    let imagesLoaded = 0;
    playerImageRight.onload = playerImageLeft.onload = playerImageJump.onload = boneImage.onload = selectedBoneImage.onload = ghostImage.onload = function() {
        imagesLoaded++;
        if (imagesLoaded === 6) {
            startGame(); // Starts with intro animation
        }
    };

    // Modified startGame function to start with intro animation
    function startGame() {
        introAnimation(); // Start animation before showing "Ready"
    }

    // Intro animation function
    function introAnimation() {
        let animationFrame = 0;
        let alpha = 0; // For fading effect

        function animateIntro() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Example of a fade-in effect with the player moving
            if (animationFrame < 100) {
                alpha = Math.min(1, alpha + 0.01);  // Increase alpha for fade-in effect
                playerX = (canvas.width / 2) + Math.sin(animationFrame / 10) * 50;
                playerY = canvas.height / 2 + Math.cos(animationFrame / 20) * 20;

                ctx.globalAlpha = alpha;  // Apply fade effect
                ctx.drawImage(currentPlayerImage, playerX, playerY, playerWidth, playerHeight);
                ctx.globalAlpha = 1; // Reset alpha to normal

                animationFrame++;
                requestAnimationFrame(animateIntro);
            } else {
                // Once animation completes, show the "Ready" screen
                showReadyScreen();
            }
        }

        animateIntro();  // Start the animation
    }

    // Show "Ready" screen
    function showReadyScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '40px Creepster';
        ctx.textAlign = 'center';

        ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        ctx.shadowBlur = 15;

        ctx.fillText('Ready', canvas.width / 2, canvas.height / 2);

        ctx.shadowColor = 'transparent';

        readySound.play();
        setTimeout(() => {
            showGoScreen();
        }, 2000);
    }

    // Show "Go" screen
    function showGoScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'green';
        ctx.font = '40px Creepster';
        ctx.textAlign = 'center';

        ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        ctx.shadowBlur = 15;

        ctx.fillText('Go!', canvas.width / 2, canvas.height / 2);

        ctx.shadowColor = 'transparent';

        goSound.play();
        setTimeout(() => {
            startGameLoop();
        }, 1000);
    }

    // Start the game loop
    function startGameLoop() {
        // Set initial player position and other game variables
        playerX = canvas.width / 2;
        playerY = canvas.height - playerHeight - 10;

        requestAnimationFrame(gameLoop);
    }

    function gameLoop() {
        if (isGameOver) return;

        // Update player position, gravity, etc.
        playerVelocityY += gravity;
        playerY += playerVelocityY;

        // Prevent player from falling off the canvas
        if (playerY > canvas.height - playerHeight) {
            playerY = canvas.height - playerHeight;
            playerVelocityY = 0;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw player character
        ctx.drawImage(currentPlayerImage, playerX, playerY, playerWidth, playerHeight);

        // Other game rendering logic like blocks, score, etc.
        // ...

        requestAnimationFrame(gameLoop);
    }

    // Handle player jump
    function jump() {
        if (playerY === canvas.height - playerHeight) {
            playerVelocityY = -jumpStrength;
            jumpSound.play();
        }
    }

    // Handle player movement (left/right)
    function movePlayer(direction) {
        if (direction === 'left' && playerX > 0) {
            playerX -= playerSpeed;
            currentPlayerImage = playerImageLeft;
        } else if (direction === 'right' && playerX < canvas.width - playerWidth) {
            playerX += playerSpeed;
            currentPlayerImage = playerImageRight;
        }
    }

    // Event listeners for controls (keyboard or buttons)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            movePlayer('left');
        } else if (e.key === 'ArrowRight') {
            movePlayer('right');
        } else if (e.key === ' ') {
            jump();
        }
    });

    // Restart game button
    restartButton.addEventListener('click', function() {
        restartGame();
    });

    // Restart the game
    function restartGame() {
        score = 0;
        souls = 0;
        isGameOver = false;
        gameSpeed = 0.5;
        playerY = canvas.height - playerHeight - 10;
        playerVelocityY = 0;

        startGame();  // Restart with intro animation
    }
};
