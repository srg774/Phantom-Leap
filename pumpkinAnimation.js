const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");

const standImages = [
    "assets/stand.png",
    "assets/stand2.png",
    "assets/stand3.png"
];
const wagImages = [
    "assets/wag1.png",
    "assets/wag2.png",
    "assets/wag3.png",
    "assets/wag4.png",
    "assets/wag5.png",
    "assets/wag6.png"
];
const wagtwistImages = [
    "assets/wagtwist1.png",
    "assets/wagtwist2.png",
    "assets/wagtwist3.png"
];

const images = {
    stand: standImages.map(src => loadImage(src)),
    wag: wagImages.map(src => loadImage(src)),
    wagtwist: wagtwistImages.map(src => loadImage(src))
};

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

let currentAnimation = "stand"; 
let currentFrame = 0;
const animationSpeed = 200; // time per frame in ms
let lastUpdateTime = 0;
let animationPhase = 0; // 0 = stand, 1 = wag, 2 = wagtwist, 3 = done

function updateAnimation() {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime >= animationSpeed) {
        currentFrame++;
        lastUpdateTime = currentTime;

        if (currentFrame >= images[currentAnimation].length) {
            currentFrame = 0;
            animationPhase++;
            switch (animationPhase) {
                case 1:
                    currentAnimation = "wag";
                    break;
                case 2:
                    currentAnimation = "wagtwist";
                    break;
                case 3:
                    fadeOutAnimation();
                    break;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = images[currentAnimation][currentFrame];
    ctx.drawImage(img, (canvas.width - 200) / 2, (canvas.height - 200) / 2, 200, 200);
}

function gameLoop() {
    updateAnimation();
    draw();
    requestAnimationFrame(gameLoop);
}

Promise.all([
    ...images.stand.map(img => new Promise(resolve => img.onload = resolve)),
    ...images.wag.map(img => new Promise(resolve => img.onload = resolve)),
    ...images.wagtwist.map(img => new Promise(resolve => img.onload = resolve))
]).then(() => {
    console.log('All images loaded');
    gameLoop();
});

function fadeOutAnimation() {
    let opacity = 1;
    function fade() {
        opacity -= 0.02;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = opacity;
        draw();
        ctx.globalAlpha = 1; // Reset after draw

        if (opacity > 0) {
            requestAnimationFrame(fade);
        } else {
            canvas.style.display = "none";
            document.getElementById("gameCanvas").style.display = "block";
            startGame();
        }
    }
    fade();
}

function startGame() {
    console.log('Starting game...');
    window.onload(); // Triggers your game.js start logic
}
