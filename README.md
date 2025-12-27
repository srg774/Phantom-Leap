# Developing a Cross Platform Game 2.0

**https://srg774.github.io/Phantom-Leap/**

# Phantom Leap

**Phantom Leap** is a spooky-themed vertical platformer game created using HTML5 Canvas and JavaScript. Players control a ghostly character that jumps across falling bones while collecting souls and avoiding a haunting demise.

## 🎮 Gameplay Overview

- Use the arrow keys (or touch controls on mobile) to move left or right and jump.
- Land on bone platforms to bounce higher.
- Catch falling ghosts to earn "souls" and increase your score.
- The game speeds up gradually, and music tempo adjusts dynamically to reflect the increasing intensity.
- If you fall or miss platforms, it's game over!

## 🕹 Controls

| Action        | Input             |
|---------------|------------------|
| Move Left     | `← Arrow` or left screen touch |
| Move Right    | `→ Arrow` or right screen touch |
| Jump          | `↑ Arrow` or `Spacebar` or tap screen |

## 📁 Assets

The game loads various assets from the `/assets/` directory:
- `spriteR.png`, `spriteL.png`, `spriteJump.png` – Player sprite variations
- `spritebone.png`, `spriteselectbone.png` – Bone platform graphics
- `spriteghost.png` – Ghost image
- Audio:
  - `theme.mp3` – Background music
  - `intro.mp3` – Intro music
  - `jump.ogg`, `ghost.ogg`, `die.ogg`, `ready.ogg`, `go.ogg`, `end.mp3` – Sound effects

Ensure these files are present in an `assets` directory relative to your HTML file.

## 🚀 Running the Game

1. Clone or download this repository.
2. Open the `index.html` file in a web browser that supports modern JavaScript and HTML5 canvas.
3. Click or press a key to unlock and start audio due to browser autoplay policies.
4. Jump, dodge, and survive!

## 🧱 Features

- Dynamic music playback speed tied to game speed.
- Ghost object animation for bonus points.
- Starfield background with animated flickering stars.
- Progressive difficulty with increasing platform speed.
- "Ready" and "Go" splash screens with corresponding sound effects.
- Themed end screen with different messages based on your performance.

## 🔊 Audio Handling

Due to browser restrictions on autoplaying audio, the game waits for a user interaction (click or keypress) to start playing the intro and theme music. Theme music resets and plays fresh each time the game starts.

## 🧙 Credits

© 2024 [SRG774]. All Rights Reserved.

Software, original artwork, and game design are the property of the creator. Music, sound effects, and character sprites were sourced via OpenGameArt.org under the CC0 (Public Domain) license. Coffin asset generated via Craiyon AI.

## 🧪 Known Issues

- Mobile controls are basic and may not behave consistently across all devices.
- Asset paths must be correctly set relative to your HTML file.
- Some audio formats (e.g., `.ogg`) may not play on all browsers; consider adding fallback formats.

## 📦 To Do (Ideas)

- Add sound toggle options.
- Implement high score tracking.
- Add new types of platforms or hazards.
- Optimize for mobile responsiveness.

---
