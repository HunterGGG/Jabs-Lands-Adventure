/* Jabs Lands Adventure - visual prototype */

class InputManager {
  constructor() {
    this.keys = new Set();
    this.pointerActive = false;
    this.joystickVector = { x: 0, y: 0 };
  }

  setKey(key, pressed) {
    if (pressed) {
      this.keys.add(key);
    } else {
      this.keys.delete(key);
    }
  }

  getAxis() {
    let x = 0;
    let y = 0;
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) x -= 1;
    if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) x += 1;
    if (this.keys.has("ArrowUp") || this.keys.has("KeyW")) y -= 1;
    if (this.keys.has("ArrowDown") || this.keys.has("KeyS")) y += 1;

    if (this.pointerActive) {
      x = this.joystickVector.x;
      y = this.joystickVector.y;
    }

    return { x, y };
  }
}

class SpriteAtlas {
  constructor(width, height) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.sprites = new Map();
  }

  add(key, x, y, w, h) {
    this.sprites.set(key, { x, y, w, h });
  }

  draw(ctx, key, x, y, scale = 1) {
    const sprite = this.sprites.get(key);
    if (!sprite) return;
    ctx.drawImage(
      this.canvas,
      sprite.x,
      sprite.y,
      sprite.w,
      sprite.h,
      Math.round(x),
      Math.round(y),
      sprite.w * scale,
      sprite.h * scale
    );
  }
}

class SpriteSheetLoader {
  static loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load sprite sheet: ${path}`));
      image.src = path;
    });
  }
}

// Пример будущего подключения:
// const playerSheet = await SpriteSheetLoader.loadImage("assets/sprites/jaba-wizard.png");
// player.animations = {
//   down: { row: 0, frames: 4 },
//   up: { row: 1, frames: 4 },
//   left: { row: 2, frames: 4 },
//   right: { row: 3, frames: 4 },
// };

const COLORS = {
  grass1: "#1a2a1f",
  grass2: "#203322",
  grass3: "#18261c",
  grassGlow: "#2e4d2e",
  path: "#2f2a24",
  water: "#1a2432",
  waterHighlight: "#2b3c52",
  trunk: "#3c2d22",
  leaf1: "#223424",
  leaf2: "#2b3f2a",
  leaf3: "#1a271c",
  stone: "#3a3f4a",
  mushroom: "#5b2d3a",
  shadow: "#0d0f16",
  robe: "#5b7d4a",
  hat: "#3a2d52",
  staff: "#4a3b2e",
  frog: "#7fd36b",
  frogDark: "#4f8b4a",
  eyes: "#121815",
  glow: "#8fd27a",
};

function buildTileAtlas() {
  const size = 16;
  const atlas = new SpriteAtlas(size * 4, size * 3);
  const ctx = atlas.ctx;

  const drawGrass = (x, y, base, accent) => {
    ctx.fillStyle = base;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = accent;
    ctx.fillRect(x + 2, y + 3, 2, 2);
    ctx.fillRect(x + 10, y + 7, 2, 2);
    ctx.fillRect(x + 6, y + 12, 2, 2);
  };

  drawGrass(0, 0, COLORS.grass1, COLORS.grassGlow);
  atlas.add("grass-1", 0, 0, size, size);

  drawGrass(size, 0, COLORS.grass2, COLORS.grassGlow);
  atlas.add("grass-2", size, 0, size, size);

  drawGrass(size * 2, 0, COLORS.grass3, COLORS.grassGlow);
  atlas.add("grass-3", size * 2, 0, size, size);

  ctx.fillStyle = COLORS.path;
  ctx.fillRect(size * 3, 0, size, size);
  ctx.fillStyle = "#41362c";
  ctx.fillRect(size * 3 + 3, 3, 4, 4);
  ctx.fillRect(size * 3 + 9, 8, 3, 3);
  atlas.add("path", size * 3, 0, size, size);

  ctx.fillStyle = COLORS.water;
  ctx.fillRect(0, size, size, size);
  ctx.fillStyle = COLORS.waterHighlight;
  ctx.fillRect(2, size + 3, 6, 2);
  ctx.fillRect(9, size + 9, 5, 2);
  atlas.add("water", 0, size, size, size);

  ctx.fillStyle = COLORS.grass2;
  ctx.fillRect(size, size, size, size);
  ctx.fillStyle = COLORS.grass3;
  ctx.fillRect(size + 6, size + 5, 4, 6);
  ctx.fillRect(size + 2, size + 11, 3, 3);
  atlas.add("grass-dark", size, size, size, size);

  ctx.fillStyle = COLORS.grass1;
  ctx.fillRect(size * 2, size, size, size);
  ctx.fillStyle = COLORS.glow;
  ctx.fillRect(size * 2 + 4, size + 4, 3, 3);
  ctx.fillRect(size * 2 + 10, size + 9, 2, 2);
  atlas.add("grass-glow", size * 2, size, size, size);

  ctx.fillStyle = COLORS.path;
  ctx.fillRect(size * 3, size, size, size);
  ctx.fillStyle = "#2a2020";
  ctx.fillRect(size * 3 + 5, size + 6, 6, 4);
  atlas.add("mud", size * 3, size, size, size);

  return atlas;
}

function buildPlayerSpriteSheet() {
  const frameWidth = 16;
  const frameHeight = 24;
  const frames = 4;
  const directions = 4;
  const canvas = document.createElement("canvas");
  canvas.width = frameWidth * frames;
  canvas.height = frameHeight * directions;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const drawFrame = (frame, dir) => {
    const x = frame * frameWidth;
    const y = dir * frameHeight;

    ctx.clearRect(x, y, frameWidth, frameHeight);
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(x + 4, y + 20, 8, 3);

    ctx.fillStyle = COLORS.robe;
    ctx.fillRect(x + 3, y + 8, 10, 12);

    ctx.fillStyle = COLORS.frog;
    ctx.fillRect(x + 4, y + 4, 8, 6);

    ctx.fillStyle = COLORS.hat;
    ctx.fillRect(x + 2, y + 1, 12, 4);
    ctx.fillRect(x + 5, y + 0, 6, 2);

    ctx.fillStyle = COLORS.staff;
    ctx.fillRect(x + 12, y + 6, 2, 14);

    ctx.fillStyle = COLORS.frogDark;
    ctx.fillRect(x + 4, y + 10, 2, 4);
    ctx.fillRect(x + 9, y + 10, 2, 4);

    if (dir === 0) {
      ctx.fillStyle = COLORS.eyes;
      ctx.fillRect(x + 5, y + 6, 2, 2);
      ctx.fillRect(x + 9, y + 6, 2, 2);
    }

    const step = frame % 2 === 0 ? 0 : 1;
    ctx.fillStyle = COLORS.robe;
    ctx.fillRect(x + 3, y + 18 + step, 4, 4);
    ctx.fillRect(x + 9, y + 18 - step, 4, 4);

    if (dir === 1) {
      ctx.fillStyle = COLORS.eyes;
      ctx.fillRect(x + 5, y + 6, 2, 2);
    }
    if (dir === 2) {
      ctx.fillStyle = COLORS.eyes;
      ctx.fillRect(x + 9, y + 6, 2, 2);
    }
  };

  for (let dir = 0; dir < directions; dir += 1) {
    for (let frame = 0; frame < frames; frame += 1) {
      drawFrame(frame, dir);
    }
  }

  return {
    image: canvas,
    frameWidth,
    frameHeight,
    frames,
  };
}

class Player {
  constructor(x, y, spriteSheet) {
    this.position = { x, y };
    this.speed = 90;
    this.size = 16;
    this.direction = 0;
    this.frame = 0;
    this.frameTimer = 0;
    this.spriteSheet = spriteSheet;
    this.stats = {
      hp: 100,
      mana: 60,
      level: 1,
      coins: 0,
      spellPower: 8,
    };
  }

  update(delta, axis, world) {
    const norm = Math.hypot(axis.x, axis.y) || 1;
    const velocity = {
      x: (axis.x / norm) * this.speed,
      y: (axis.y / norm) * this.speed,
    };

    if (axis.x !== 0 || axis.y !== 0) {
      if (Math.abs(axis.x) > Math.abs(axis.y)) {
        this.direction = axis.x > 0 ? 2 : 1;
      } else {
        this.direction = axis.y > 0 ? 0 : 3;
      }

      this.frameTimer += delta;
      if (this.frameTimer > 0.18) {
        this.frame = (this.frame + 1) % this.spriteSheet.frames;
        this.frameTimer = 0;
      }
    } else {
      this.frame = 0;
      this.frameTimer = 0;
    }

    const nextX = this.position.x + velocity.x * delta;
    const nextY = this.position.y + velocity.y * delta;

    if (!world.isBlocked(nextX, this.position.y, this.size)) {
      this.position.x = nextX;
    }
    if (!world.isBlocked(this.position.x, nextY, this.size)) {
      this.position.y = nextY;
    }
  }

  render(ctx) {
    const { frameWidth, frameHeight, frames, image } = this.spriteSheet;
    const frame = this.frame;
    const sx = frame * frameWidth;
    const sy = this.direction * frameHeight;
    const drawX = Math.round(this.position.x - frameWidth / 2);
    const drawY = Math.round(this.position.y - frameHeight + 4);
    ctx.drawImage(image, sx, sy, frameWidth, frameHeight, drawX, drawY, frameWidth, frameHeight);
  }
}

class World {
  constructor(tileSize, atlas) {
    this.tileSize = tileSize;
    this.width = 40;
    this.height = 22;
    this.biome = "Dark Forest";
    this.description = "Лес шепчет, а мох пьёт лунный свет.";
    this.atlas = atlas;
    this.tiles = this.generateTiles();
    this.decorations = this.generateDecorations();
  }

  generateTiles() {
    const tiles = [];
    for (let y = 0; y < this.height; y += 1) {
      const row = [];
      for (let x = 0; x < this.width; x += 1) {
        const edge = x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1;
        if (edge) {
          row.push("grass-dark");
        } else {
          const roll = (x * 7 + y * 11) % 10;
          if (roll < 3) row.push("grass-1");
          else if (roll < 6) row.push("grass-2");
          else row.push("grass-3");
        }
      }
      tiles.push(row);
    }

    for (let x = 6; x < 16; x += 1) {
      tiles[10][x] = "path";
      tiles[11][x] = "mud";
    }

    tiles[14][18] = "water";
    tiles[14][19] = "water";
    tiles[15][18] = "water";
    tiles[15][19] = "water";

    return tiles;
  }

  generateDecorations() {
    return [
      { type: "tree", x: 4, y: 4 },
      { type: "tree", x: 10, y: 3 },
      { type: "tree", x: 20, y: 5 },
      { type: "tree", x: 30, y: 4 },
      { type: "tree", x: 34, y: 12 },
      { type: "tree", x: 8, y: 14 },
      { type: "rock", x: 15, y: 7 },
      { type: "rock", x: 22, y: 9 },
      { type: "mushroom", x: 12, y: 12 },
      { type: "mushroom", x: 26, y: 15 },
      { type: "stump", x: 18, y: 6 },
      { type: "bush", x: 6, y: 9 },
      { type: "bush", x: 28, y: 8 },
      { type: "glow", x: 24, y: 4 },
    ];
  }

  isBlocked(x, y, size) {
    const half = size / 2;
    const points = [
      { x: x - half, y: y - half },
      { x: x + half, y: y - half },
      { x: x - half, y: y + half },
      { x: x + half, y: y + half },
    ];

    return points.some((point) => {
      const tileX = Math.floor(point.x / this.tileSize);
      const tileY = Math.floor(point.y / this.tileSize);
      if (tileX < 0 || tileY < 0 || tileX >= this.width || tileY >= this.height) return true;
      const tile = this.tiles[tileY][tileX];
      return tile === "water";
    });
  }

  renderBase(ctx) {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const tile = this.tiles[y][x];
        this.atlas.draw(ctx, tile, x * this.tileSize, y * this.tileSize);
      }
    }
  }

  renderDecorations(ctx) {
    this.decorations.forEach((decor) => {
      const x = decor.x * this.tileSize;
      const y = decor.y * this.tileSize;

      switch (decor.type) {
        case "tree":
          ctx.fillStyle = COLORS.shadow;
          ctx.fillRect(x + 4, y + 20, 16, 6);
          ctx.fillStyle = COLORS.trunk;
          ctx.fillRect(x + 10, y + 14, 6, 12);
          ctx.fillStyle = COLORS.leaf2;
          ctx.fillRect(x + 2, y, 22, 16);
          ctx.fillStyle = COLORS.leaf1;
          ctx.fillRect(x + 5, y + 4, 16, 10);
          ctx.fillStyle = COLORS.leaf3;
          ctx.fillRect(x + 8, y + 2, 10, 8);
          break;
        case "rock":
          ctx.fillStyle = COLORS.shadow;
          ctx.fillRect(x + 4, y + 12, 10, 4);
          ctx.fillStyle = COLORS.stone;
          ctx.fillRect(x + 5, y + 6, 12, 8);
          break;
        case "mushroom":
          ctx.fillStyle = COLORS.shadow;
          ctx.fillRect(x + 5, y + 13, 8, 3);
          ctx.fillStyle = COLORS.mushroom;
          ctx.fillRect(x + 4, y + 7, 10, 6);
          ctx.fillStyle = COLORS.leaf1;
          ctx.fillRect(x + 7, y + 10, 4, 4);
          break;
        case "stump":
          ctx.fillStyle = COLORS.shadow;
          ctx.fillRect(x + 6, y + 14, 8, 3);
          ctx.fillStyle = COLORS.trunk;
          ctx.fillRect(x + 6, y + 8, 10, 8);
          ctx.fillStyle = "#624d3a";
          ctx.fillRect(x + 8, y + 10, 4, 4);
          break;
        case "bush":
          ctx.fillStyle = COLORS.shadow;
          ctx.fillRect(x + 4, y + 12, 12, 4);
          ctx.fillStyle = COLORS.leaf2;
          ctx.fillRect(x + 3, y + 6, 14, 8);
          ctx.fillStyle = COLORS.leaf1;
          ctx.fillRect(x + 6, y + 8, 8, 5);
          break;
        case "glow":
          ctx.fillStyle = COLORS.glow;
          ctx.fillRect(x + 7, y + 6, 4, 4);
          ctx.fillStyle = "rgba(130, 210, 120, 0.5)";
          ctx.fillRect(x + 4, y + 3, 10, 10);
          break;
        default:
          break;
      }
    });
  }
}

class DialogueBox {
  constructor(root) {
    this.root = root;
    this.textEl = root.querySelector("#dialogue-text");
    this.optionsEl = root.querySelector("#dialogue-options");
    this.timer = null;
  }

  show(text) {
    this.textEl.textContent = "";
    this.optionsEl.innerHTML = "";
    this.root.classList.add("visible");
    let index = 0;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.textEl.textContent += text[index] || "";
      index += 1;
      if (index >= text.length) {
        clearInterval(this.timer);
      }
    }, 24);
  }

  hide() {
    clearInterval(this.timer);
    this.root.classList.remove("visible");
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.root = document.getElementById("game-root");

    this.menu = document.getElementById("menu");
    this.menuMain = document.getElementById("menu-main");
    this.menuPause = document.getElementById("menu-pause");
    this.newGameButton = document.getElementById("new-game");
    this.continueButton = document.getElementById("continue");
    this.exitButton = document.getElementById("exit");
    this.resumeButton = document.getElementById("resume");
    this.saveExitButton = document.getElementById("save-exit");
    this.exitMainButton = document.getElementById("exit-main");
    this.mobileMenuButton = document.getElementById("mobile-menu");

    this.dialogue = new DialogueBox(document.getElementById("dialogue"));

    this.hud = {
      hp: document.getElementById("hp"),
      mana: document.getElementById("mana"),
      level: document.getElementById("level"),
      coins: document.getElementById("coins"),
    };

    this.input = new InputManager();
    this.tileSize = 16;
    this.tileAtlas = buildTileAtlas();
    this.playerSheet = buildPlayerSpriteSheet();
    this.world = new World(this.tileSize, this.tileAtlas);
    this.player = new Player(120, 120, this.playerSheet);
    this.lastTimestamp = 0;
    this.isRunning = false;
    this.menuState = "main";

    this.bindEvents();
    this.refreshContinueState();
    this.showMenu(true, "main");
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resizeCanvas());
    this.resizeCanvas();

    window.addEventListener("keydown", (event) => {
      if (event.repeat) return;
      this.input.setKey(event.code, true);
      if (event.code === "Escape") {
        this.toggleMenu();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.input.setKey(event.code, false);
    });

    this.newGameButton.addEventListener("click", () => this.startNewGame());
    this.continueButton.addEventListener("click", () => this.loadGame());
    this.exitButton.addEventListener("click", () => this.exitGame());
    this.resumeButton.addEventListener("click", () => this.resumeGame());
    this.saveExitButton.addEventListener("click", () => this.saveAndExit());
    this.exitMainButton.addEventListener("click", () => this.exitToMainMenu());
    this.mobileMenuButton.addEventListener("click", () => this.togglePauseMenu());

    const joystick = document.getElementById("joystick");
    const knob = document.getElementById("joystick-knob");
    const rectFor = () => joystick.getBoundingClientRect();
    const maxRadius = 36;

    const handlePointer = (event) => {
      const rect = rectFor();
      const dx = event.clientX - rect.left - rect.width / 2;
      const dy = event.clientY - rect.top - rect.height / 2;
      const distance = Math.hypot(dx, dy);
      const clamped = Math.min(distance, maxRadius);
      const angle = Math.atan2(dy, dx);
      const x = Math.cos(angle) * clamped;
      const y = Math.sin(angle) * clamped;
      knob.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      this.input.joystickVector = {
        x: x / maxRadius,
        y: y / maxRadius,
      };
    };

    joystick.addEventListener("pointerdown", (event) => {
      joystick.setPointerCapture(event.pointerId);
      this.input.pointerActive = true;
      handlePointer(event);
    });

    joystick.addEventListener("pointermove", (event) => {
      if (!this.input.pointerActive) return;
      handlePointer(event);
    });

    const releaseJoystick = () => {
      this.input.pointerActive = false;
      this.input.joystickVector = { x: 0, y: 0 };
      knob.style.transform = "translate(-50%, -50%)";
    };

    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);

    document.getElementById("action-1").addEventListener("click", () => {
      this.dialogue.show("Жаба выпускает тьму, но это ещё заготовка!");
    });

    document.getElementById("action-2").addEventListener("click", () => {
      this.dialogue.show("В тени слышится шёпот — скоро здесь будет NPC.");
    });
  }

  resizeCanvas() {
    this.canvas.width = this.tileSize * this.world.width;
    this.canvas.height = this.tileSize * this.world.height;
    this.ctx.imageSmoothingEnabled = false;
  }

  refreshContinueState() {
    const save = localStorage.getItem("jabs-save");
    this.continueButton.disabled = !save;
  }

  showMenu(visible, state) {
    this.menuState = state;
    this.menuMain.classList.toggle("visible", state === "main");
    this.menuPause.classList.toggle("visible", state === "pause");
    this.menu.classList.toggle("visible", visible);
    this.isRunning = !visible;
    this.root.classList.toggle("state-gameplay", !visible);
    this.root.classList.toggle("state-menu", visible);
    if (visible) {
      this.saveGame();
    } else {
      requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
  }

  toggleMenu() {
    this.togglePauseMenu();
  }

  startNewGame() {
    this.player = new Player(120, 120, this.playerSheet);
    this.world = new World(this.tileSize, this.tileAtlas);
    this.showMenu(false, "pause");
    this.dialogue.show(`${this.world.description}`);
  }

  saveGame() {
    const payload = {
      player: this.player.position,
      stats: this.player.stats,
      biome: this.world.biome,
    };
    localStorage.setItem("jabs-save", JSON.stringify(payload));
    this.refreshContinueState();
  }

  loadGame() {
    const data = localStorage.getItem("jabs-save");
    if (!data) return;
    try {
      const payload = JSON.parse(data);
      this.player = new Player(payload.player.x, payload.player.y, this.playerSheet);
      this.player.stats = payload.stats;
      this.world = new World(this.tileSize, this.tileAtlas);
      this.world.biome = payload.biome || this.world.biome;
    } catch (error) {
      console.warn("Save corrupted", error);
    }
    this.showMenu(false, "pause");
    this.dialogue.show(`${this.world.description}`);
  }

  exitGame() {
    this.showMenu(true, "main");
  }

  resumeGame() {
    this.showMenu(false, "pause");
  }

  saveAndExit() {
    this.saveGame();
    this.showMenu(true, "main");
    this.dialogue.show("Сохранение завершено. Возвращайся в сумрак.");
  }

  exitToMainMenu() {
    this.showMenu(true, "main");
  }

  togglePauseMenu() {
    if (this.menu.classList.contains("visible") && this.menuState === "main") {
      return;
    }
    if (this.menu.classList.contains("visible") && this.menuState === "pause") {
      this.showMenu(false, "pause");
      return;
    }
    this.showMenu(true, "pause");
  }

  update(delta) {
    const axis = this.input.getAxis();
    this.player.update(delta, axis, this.world);
  }

  updateHud() {
    this.hud.hp.textContent = this.player.stats.hp;
    this.hud.mana.textContent = this.player.stats.mana;
    this.hud.level.textContent = this.player.stats.level;
    this.hud.coins.textContent = this.player.stats.coins;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.world.renderBase(this.ctx);
    this.world.renderDecorations(this.ctx);
    this.player.render(this.ctx);
  }

  gameLoop(timestamp) {
    if (!this.isRunning) return;
    const delta = (timestamp - this.lastTimestamp) / 1000 || 0;
    this.lastTimestamp = timestamp;

    this.update(delta);
    this.render();
    this.updateHud();

    requestAnimationFrame((nextTimestamp) => this.gameLoop(nextTimestamp));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new Game();
});
