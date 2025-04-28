window.onload = function() {
    const gameCanvas = document.getElementById('gameCanvas');
    const gameCtx = gameCanvas.getContext('2d');
    const titleCanvas = document.getElementById('titleCanvas');
    const titleCtx = titleCanvas.getContext('2d');
    const restartButton = document.getElementById('restartButton');

    gameCanvas.width = 400;
    gameCanvas.height = 600;
    titleCanvas.width = 400;
    titleCanvas.height = 400;

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

    let gameImagesLoaded = 0;
    let allGameImagesLoaded = false;
    playerImageRight.onload = playerImageLeft.onload = playerImageJump.onload = boneImage.onload = selectedBoneImage.onload = ghostImage.onload = function() {
        gameImagesLoaded++;
        if (gameImagesLoaded === 6) {
            allGameImagesLoaded = true;
            if (titleAnimationLoaded) {
                playTitleAnimationSequence();
            }
        }
    };

    const standImageSrcs = [
        "assets/stand.png",
        "assets/stand2.png",
        "assets/stand3.png"
    ];
    const wagImageSrcs = [
        "assets/wag1.png",
        "assets/wag2.png",
        "assets/wag3.png",
        "assets/wag4.png",
        "assets/wag5.png",
        "assets/wag6.png"
    ];
    const wagtwistImageSrcs = [
        "assets/wagtwist1.png",
        "assets/wagtwist2.png",
        "assets/wagtwist3.png"
    ];

    let titleAnimationImages = {
        stand: [],
        wag: [],
        wagtwist: []
    };
    const titleAnimationSpeed = 200;
    let titleAnimationLoaded = false;
    let currentAnimationSequence = [];
    let currentSequenceIndex = 0;
    let currentFrameIndex = 0;
    let lastFrameTime = 0;

    function loadTitleAnimationImages() {
        let loadedCount = 0;
        const totalImages = standImageSrcs.length + wagImageSrcs.length + wagtwistImageSrcs.length;

        const loadImage = (src, category, array) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                array.push(img);
                loadedCount++;
                if (loadedCount === totalImages) {
                    titleAnimationLoaded = true;
                    if (allGameImagesLoaded) {
                        playTitleAnimationSequence();
                    }
                }
            };
            img.onerror = () => console.error(`Error loading ${src}`);
        };

        standImageSrcs.forEach(src => loadImage(src, 'stand', titleAnimationImages.stand));
        wagImageSrcs.forEach(src => loadImage(src, 'wag', titleAnimationImages.wag));
        wagtwistImageSrcs.forEach(src => loadImage(src, 'wagtwist', titleAnimationImages.wagtwist));
    }

    function playTitleAnimationSequence() {
        currentAnimationSequence = ['stand', 'wag', 'wagtwist'];
        currentSequenceIndex = 0;
        currentFrameIndex = 0;
        lastFrameTime = 0;
        titleCanvas.style.display = 'flex';
        gameCanvas.style.display = 'none';
        requestAnimationFrame(updateTitleAnimation);
    }

    function updateTitleAnimation(timestamp) {
        if (!currentAnimationSequence.length) {
            titleCanvas.style.display = 'none';
            gameCanvas.style.display = 'block';
            startGame();
            return;
        }

        const currentAnimationName = currentAnimationSequence[currentSequenceIndex];
        const frames = titleAnimationImages[currentAnimationName];

        if (!frames || frames.length === 0) {
            currentSequenceIndex++;
            if (currentSequenceIndex >= currentAnimationSequence.length) {
                titleCanvas.style.display = 'none';
                gameCanvas.style.display = 'block';
                startGame();
                return;
            }
            requestAnimationFrame(updateTitleAnimation);
            return;
        }

        if (timestamp - lastFrameTime >= titleAnimationSpeed) {
            drawTitleFrame(frames[currentFrameIndex]);
            currentFrameIndex++;
            lastFrameTime = timestamp;

            if (currentFrameIndex >= frames.length) {
                currentFrameIndex = 0;
                currentSequenceIndex++;
                if (currentSequenceIndex >= currentAnimationSequence.length) {
                    titleCanvas.style.display = 'none';
                    gameCanvas.style.display = 'block';
                    startGame();
                    return;
                }
            }
        }
        requestAnimationFrame(updateTitleAnimation);
    }

    function drawTitleFrame(img) {
        titleCtx.clearRect(0, 0, titleCanvas.width, titleCanvas.height);
        titleCtx.fillStyle = "#000";
        titleCtx.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
        if (img) {
            titleCtx.drawImage(img, titleCanvas.width / 2 - 100, titleCanvas.height / 2 - 100, 200, 200);
        }
    }

    function startGame() {
        initializeStars();
        showReadyScreen();
    }

    function showReadyScreen() {
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        gameCtx.fillStyle = 'red';
        gameCtx.font = '40px Creepster';
        gameCtx.textAlign = 'center';
        gameCtx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        gameCtx.shadowBlur = 15;
        gameCtx.fillText('Ready', gameCanvas.width / 2, gameCanvas.height / 2);
        gameCtx.shadowColor = 'transparent';
        readySound.play();
        setTimeout(() => {
            showGoScreen();
        }, 2000);
    }

    function showGoScreen() {
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        gameCtx.fillStyle = 'red';
        gameCtx.font = '40px Creepster';
        gameCtx.textAlign = 'center';
        gameCtx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        gameCtx.shadowBlur = 15;
        gameCtx.fillText('Go', gameCanvas.width / 2, gameCanvas.height / 2);
        goSound.play();
        setTimeout(() => {
            resetGame();
            introMusic.pause();
            introMusic.currentTime = 0;
            themeMusic.play();
            themeMusicStartTime = performance.now();
            requestAnimationFrame(gameLoop);
        }, 1000);
        gameCtx.shadowColor = 'transparent';
    }

    function resetGame() {
        isGameOver = false;
        gameSpeed = 0.5;
        score = 0;
        souls = 0;
        playerX = gameCanvas.width / 2 - playerWidth / 2;
        playerY = gameCanvas.height / 2 - playerHeight / 2;
        playerVelocityY = 0;
        playerVelocityX = 0;
        blocks.length = 0;
        ghostObject = null;
        generateInitialBlocks();
        restartButton.style.display = 'none';
    }

    function generateInitialBlocks() {
        for (let i = 0; i < 5; i++) {
            generateBlock(gameCanvas.height - i * blockSpacing);
        }
    }

    function generateBlock() {
        if (blocks.length === 0 || blocks[blocks.length - 1].y > blockSpacing) {
            const block = {
                x: Math.random() * (gameCanvas.width - blockWidth),
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
                jumpSound.play();
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

    gameCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch.clientX < gameCanvas.width / 2) {
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
            jumpSound.play();
        }
    });

    gameCanvas.addEventListener('touchend', function(e) {
        playerVelocityX = 0;
        jumpRequested = false;
    });

    function jump() {
        playerVelocityY = -jumpStrength;
    }

    let ghostObject = null;

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
                    ghostSound.currentTime = 0;
                    ghostSound.play();
                }
            }
        });
    }

    function checkGameOver() {
        if (playerY > gameCanvas.height) {
            isGameOver = true;
        }
        blocks.forEach(block => {
            if (block.y > gameCanvas.height && !block.hit) {
                block.missed = true;
                isGameOver = true;
            }
        });
    }

    const blockGenerationInterval = 1000;
    let lastBlockGenerationTime = 0;

    function gameLoop(timestamp) {
        if (isGameOver) {
            gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
            endMusic.play();
            let endMessage;
            if (souls < 100) {
                endMessage = "Ghosted!";
            } else if (souls < 300) {
                endMessage = "Spooky Score!";
            } else {
                endMessage = "Hauntingly Good!";
            }
            gameCtx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            gameCtx.font = '50px Creepster';
            gameCtx.textAlign = 'center';
            gameCtx.shadowColor = 'rgba(255, 0, 0, 0.8)';
            gameCtx.shadowBlur = 15;
            gameCtx.fillText('Game Over', gameCanvas.width / 2, gameCanvas.height / 2 - 60);
            gameCtx.font = '20px Creepster';
            gameCtx.fillText(endMessage, gameCanvas.width / 2, gameCanvas.height / 2 - 20);
            gameCtx.fillText('Souls: ' + souls, gameCanvas.width / 2, gameCanvas.height / 2 + 20);
            gameCtx.font = '16px Creepster';
            gameCtx.fillText('By S.Gilchrist 2024 CC-BY-NC 4.0', gameCanvas.width / 2, gameCanvas.height / 2 + 60);
            restartButton.style.display = 'block';
            gameCtx.shadowColor = 'transparent';
            themeMusic.pause();
            themeMusic.currentTime = 0;
            return;
        }
        playerVelocityY += gravity;
        if (playerVelocityY > maxSpeed) playerVelocity
