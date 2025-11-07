window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const restartButton = document.getElementById('restartButton');
    
    // --- MUTE ICON CONFIGURATION ---
    const MUTE_ICON_X = 10;
    const MUTE_ICON_Y = 60; 
    const MUTE_ICON_SIZE = 25;
    // -------------------------------

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

    // --- AUDIO ELEMENTS ---
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
    
    // --- MUTE INTEGRATION Logic ---
    const allAudioElements = [
        themeMusic, 
        introMusic, 
        jumpSound, 
        ghostSound, 
        dieSound, 
        readySound, 
        goSound, 
        endMusic
    ];
    
    let isGloballyMuted = false;

    function updateMuteState(isMuted) {
        isGloballyMuted = isMuted;

        // Toggle the 'muted' property on *all* audio elements
        allAudioElements.forEach(audio => {
            audio.muted = isMuted;
            // When unmuting, ensure music is still paused if the game isn't running
            if (!isMuted && !isGameOver && audio === themeMusic && themeMusic.paused) {
                 // Do nothing here, music will be played in showGoScreen/unlockAudio
            }
        });
    }

    function toggleMute() {
        updateMuteState(!isGloballyMuted);

        // Crucial fix: If we are unmuting AND the game has started, resume theme music
        if (!isGloballyMuted && !isGameOver && themeMusic.paused && themeMusic.currentTime > 0) {
            themeMusic.play().catch(err => console.error("Theme music resume error:", err));
        }
    }
    
    updateMuteState(false);
    // -----------------------------

function unlockAudio() {
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);

    // Only attempt to play music if we are *not* currently muted
    if (!isGloballyMuted) {
        introMusic.play().catch(err => console.error("Intro music error:", err));
        themeMusic.play().catch(err => console.error("Theme music error:", err));
    }

    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
}
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

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

    const baseTempo = 1.0;
    const tempoIncreaseFactor = 1.0;
    let themeMusicStartTime = null;

    function startGame() {
        initializeStars();
        showReadyScreen();
    }

function showReadyScreen() {
    // If not muted, pause the theme music gracefully for the ready sequence
    if (!isGloballyMuted) {
        themeMusic.pause();
    }
    themeMusic.currentTime = 0; 
    themeMusic.volume = 0.2; 

    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = '40px Creepster';
    ctx.textAlign = 'center';

    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 15;

    ctx.fillText('Ready', canvas.width / 2, canvas.height / 2);

    ctx.shadowColor = 'transparent';

    if (!isGloballyMuted) {
        readySound.play();
    }
    
    setTimeout(() => {
        showGoScreen();
    }, 2000);
}

function showGoScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = '40px Creepster';
    ctx.textAlign = 'center';

    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 15;

    ctx.fillText('Go', canvas.width / 2, canvas.height / 2);

    if (!isGloballyMuted) {
        goSound.play();
    }
    
    setTimeout(() => {
        resetGame();
        introMusic.pause();
        introMusic.currentTime = 0; 
        themeMusic.currentTime = 0; 

        if (!isGloballyMuted) {
            themeMusic.play();
        }
        
        themeMusicStartTime = performance.now(); 
        themeMusic.volume = 0.2; 
        themeMusic.playbackRate = 1.0; 

        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }

        requestAnimationFrame(gameLoop);
    }, 1000);

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

    themeMusic.currentTime = 0; 
    themeMusic.playbackRate = 1.0; 

    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
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
                if (!isGloballyMuted) jumpSound.play();
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

    // --- REVERTED TOUCH LOGIC FOR MOVEMENT (AS REQUESTED) ---
    canvas.addEventListener('touchstart', function(e) {
        // First, check if the touch was on the mute icon (handled in the dedicated listener below)
        const rect = canvas.getBoundingClientRect();
        const touchX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
        const touchY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);

        // If the touch is within the mute icon area, DO NOT proceed with movement
        if (
            touchX >= MUTE_ICON_X && 
            touchX <= MUTE_ICON_X + MUTE_ICON_SIZE && 
            touchY >= MUTE_ICON_Y && 
            touchY <= MUTE_ICON_Y + MUTE_ICON_SIZE
        ) {
            // Let the dedicated click/touch listener handle the mute/unmute
            return; 
        }

        e.preventDefault();
        const touch = e.touches[0];
        
        // This is the original logic for movement/jump
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
            if (!isGloballyMuted) jumpSound.play();
        }
    });

    canvas.addEventListener('touchend', function(e) {
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
                    gameSpeed += 0.0075;
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
                    if (!isGloballyMuted) {
                        ghostSound.currentTime = 0;
                        ghostSound.play();
                    }
                }
            }
        });
    }

    function checkGameOver() {
        if (playerY > canvas.height) {
            isGameOver = true;
            if (!isGloballyMuted) {
                dieSound.play();
            }
        }
        blocks.forEach(block => {
            if (block.y > canvas.height && !block.hit) {
                block.missed = true;
                isGameOver = true;
                if (!isGloballyMuted) {
                    dieSound.play();
                }
            }
        });
    }

    const blockGenerationInterval = 900;
    let lastBlockGenerationTime = 0;

    function gameLoop(timestamp) {
        if (isGameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (!isGloballyMuted) {
                endMusic.play();
            }

            // Update Media Session state
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }

            let endMessage;
            if (souls < 100) {
                endMessage = "Ghosted!";
            } else if (souls < 200) {
                endMessage = "Spooky Score!";
            } else {
                endMessage = "Hauntingly Good!";
            }

            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.font = '50px Creepster';
            ctx.textAlign = 'center';

            ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
            ctx.shadowBlur = 15;

            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 60);
            ctx.font = '20px Creepster';
            ctx.fillText(endMessage, canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('Souls: ' + souls, canvas.width / 2, canvas.height / 2 + 20);
            ctx.font = '14px Creepster';
            ctx.fillText('If notifications, try "Do Not Disturb"', canvas.width / 2, canvas.height / 2 + 90);
            ctx.font = '12px Creepster'; 
            ctx.fillText('By S.Gilchrist 2024 CC-BY-NC 4.0', canvas.width / 2, canvas.height / 2 + 110);

            restartButton.style.display = 'block';
            ctx.shadowColor = 'transparent';

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

        if (themeMusicStartTime) {
            const elapsed = timestamp - themeMusicStartTime;
            const tempoIncrease = Math.min(tempoIncreaseFactor, (elapsed / 600000) * tempoIncreaseFactor);
            themeMusic.playbackRate = baseTempo + (gameSpeed / maxSpeed) * tempoIncrease;
        }

        ctx.fillStyle = 'red';
        ctx.font = '20px Creepster';
        ctx.textAlign = 'left';

        ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        ctx.shadowBlur = 15;

        ctx.fillText('Souls: ' + souls, 10, 30);

        ctx.shadowColor = 'transparent';

        // Draw Mute Icon
        drawMuteIcon();

        requestAnimationFrame(gameLoop);
    }

    function drawMuteIcon() {
        ctx.font = `${MUTE_ICON_SIZE}px sans-serif`; 
        ctx.textAlign = 'left';
        
        const iconSymbol = isGloballyMuted ? '🔇' : '🔊'; 
        
        ctx.fillStyle = isGloballyMuted ? '#FF0000' : '#00FF00'; 
        
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        
        ctx.fillText(iconSymbol, MUTE_ICON_X, MUTE_ICON_Y);

        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }

    // --- DEDICATED MUTE ICON CLICK/TOUCH LISTENER (Fixing the Glitch) ---
    function handleMuteClick(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Get touch/click position relative to the canvas
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const canvasX = (clientX - rect.left) * scaleX;
        const canvasY = (clientY - rect.top) * scaleY;
        
        // Check if the click/touch occurred within the MUTE ICON area
        if (
            canvasX >= MUTE_ICON_X && 
            canvasX <= MUTE_ICON_X + MUTE_ICON_SIZE && 
            canvasY >= MUTE_ICON_Y && 
            canvasY <= MUTE_ICON_Y + MUTE_ICON_SIZE
        ) {
            toggleMute();
            e.preventDefault(); 
            e.stopPropagation();
        }
    }
    canvas.addEventListener('click', handleMuteClick);
    canvas.addEventListener('touchstart', handleMuteClick);
    // ----------------------------------------------------------------------


    let starData = [];

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
                ghostObject = null;
            }
        }
    }

    restartButton.addEventListener('click', () => {
        resetGame();
        startGame();
    });
};
