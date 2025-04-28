// pumpkinAnimation.js
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
const animationSpeed = 200;
let lastUpdateTime = 0;

function updateAnimation() {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime >= animationSpeed) {
        currentFrame = (currentFrame + 1) % images[currentAnimation].length;
        lastUpdateTime = currentTime;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = images[currentAnimation][currentFrame];
    ctx.drawImage(img, 50, 50, 200, 200);
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
    // Animation finished, trigger fade out and start game
    setTimeout(() => {
        fadeOutAnimation();
    }, animationSpeed * images[currentAnimation].length);
});

function fadeOutAnimation() {
    let opacity = 1;
    const fadeOutInterval = setInterval(() => {
        opacity -= 0.05;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = opacity;
        draw();
        if (opacity <= 0) {
            clearInterval(fadeOutInterval);
            startGame();
        }
    }, 20);
}

function startGame() {
    // After the animation fades out, trigger the game start logic
    // For example, show "Ready" screen and then "Go"
    console.log('Game is starting...');
    // Your code to transition to the main game goes here
}
