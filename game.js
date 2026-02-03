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

class TileSet {
  constructor(image, tileSize, lookup) {
    this.image = image;
    this.tileSize = tileSize;
    this.lookup = lookup;
  }

  draw(ctx, key, x, y, scale = 1) {
    const tile = this.lookup[key];
    if (!tile || !this.image) return;
    const { col, row } = tile;
    const size = this.tileSize;
    ctx.drawImage(
      this.image,
      col * size,
      row * size,
      size,
      size,
      Math.round(x),
      Math.round(y),
      size * scale,
      size * scale
    );
  }
}

class AnimatedSprite {
  constructor({ image, frameWidth, frameHeight, scale = 1, frameRate = 10 }) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.scale = scale;
    this.frameRate = frameRate;
    this.frameTimer = 0;
    this.frame = 0;
    this.frames = Math.max(1, Math.floor(image.width / frameWidth));
    this.rows = Math.max(1, Math.floor(image.height / frameHeight));
  }

  update(delta) {
    this.frameTimer += delta;
    if (this.frameTimer >= 1 / this.frameRate) {
      this.frame = (this.frame + 1) % this.frames;
      this.frameTimer = 0;
    }
  }

  draw(ctx, x, y, row = 0, flip = false) {
    if (!this.image) return;
    const sx = this.frame * this.frameWidth;
    const sy = Math.min(row, this.rows - 1) * this.frameHeight;
    const drawW = this.frameWidth * this.scale;
    const drawH = this.frameHeight * this.scale;
    ctx.save();
    if (flip) {
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.image,
        sx,
        sy,
        this.frameWidth,
        this.frameHeight,
        -Math.round(x + drawW),
        Math.round(y),
        drawW,
        drawH
      );
    } else {
      ctx.drawImage(
        this.image,
        sx,
        sy,
        this.frameWidth,
        this.frameHeight,
        Math.round(x),
        Math.round(y),
        drawW,
        drawH
      );
    }
    ctx.restore();
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

const TILE_LOOKUP = {
  "grass-1": { col: 0, row: 0 },
  "grass-2": { col: 1, row: 0 },
  "grass-3": { col: 2, row: 0 },
  "grass-dark": { col: 3, row: 0 },
  path: { col: 4, row: 0 },
  mud: { col: 5, row: 0 },
  "grass-edge": { col: 6, row: 0 },
};

const ASSET_MANIFEST = {
  tilemap: "assets/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color2.png",
  waterTile: "assets/Tiny Swords (Free Pack)/Terrain/Tileset/Water Background color.png",
  waterFoam: "assets/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png",
  bush1: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe1.png",
  bush2: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe2.png",
  bush3: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe3.png",
  bush4: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe4.png",
  rock1: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock1.png",
  rock2: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock2.png",
  rock3: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock3.png",
  rock4: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock4.png",
  waterRock: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks in the Water/Water Rocks_02.png",
  rubberDuck: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Rubber Duck/Rubber duck.png",
  cloud1: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Clouds/Clouds_01.png",
  cloud2: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Clouds/Clouds_02.png",
  cloud3: "assets/Tiny Swords (Free Pack)/Terrain/Decorations/Clouds/Clouds_03.png",
  house: "assets/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/House1.png",
  house2: "assets/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/House2.png",
  tower: "assets/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Tower.png",
  barracks: "assets/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Barracks.png",
  castle: "assets/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Castle.png",
  archery: "assets/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Archery.png",
  enemyArcher: "assets/Tiny Swords (Free Pack)/Units/Red Units/Archer/Archer_Idle.png",
  enemyLancer: "assets/Tiny Swords (Free Pack)/Units/Red Units/Lancer/Lancer_Idle.png",
  playerIdle: "assets/Tiny Swords (Free Pack)/Units/Blue Units/Monk/Idle.png",
  playerRun: "assets/Tiny Swords (Free Pack)/Units/Blue Units/Monk/Run.png",
  playerCast: "assets/Tiny Swords (Free Pack)/Units/Blue Units/Monk/Heal.png",
  castEffect: "assets/Tiny Swords (Free Pack)/Units/Blue Units/Monk/Heal_Effect.png",
  explosion: "assets/Tiny Swords (Free Pack)/Particle FX/Explosion_02.png",
  cursor: "assets/Tiny Swords (Free Pack)/UI Elements/UI Elements/Cursors/Cursor_04.png",
};

const loadAssets = () => {
  const entries = Object.entries(ASSET_MANIFEST);
  return Promise.all(
    entries.map(([key, path]) =>
      SpriteSheetLoader.loadImage(path).then((image) => [key, image])
    )
  ).then((loaded) => Object.fromEntries(loaded));
};

class Player {
  constructor(x, y, animations) {
    this.position = { x, y };
    this.speed = 140;
    this.size = 24;
    this.direction = 0;
    this.animations = animations;
    this.activeAnimation = "idle";
    this.lastAnimation = "idle";
    this.castTimer = 0;
    this.flip = false;
    this.stats = {
      hp: 100,
      mana: 60,
      level: 1,
      coins: 0,
      spellPower: 8,
    };
  }

  setCast() {
    this.castTimer = 0.4;
    this.setAnimation("cast");
  }

  setAnimation(name) {
    if (this.activeAnimation === name) return;
    this.activeAnimation = name;
    const animation = this.animations[name];
    if (animation) {
      animation.frame = 0;
      animation.frameTimer = 0;
    }
  }

  update(delta, axis, world) {
    const norm = Math.hypot(axis.x, axis.y) || 1;
    const velocity = {
      x: (axis.x / norm) * this.speed,
      y: (axis.y / norm) * this.speed,
    };

    const isMoving = axis.x !== 0 || axis.y !== 0;
    if (isMoving) {
      if (Math.abs(axis.x) > Math.abs(axis.y)) {
        this.direction = 1;
        this.flip = axis.x < 0;
      } else {
        this.direction = axis.y > 0 ? 0 : 2;
        this.flip = false;
      }
    }

    if (this.castTimer > 0) {
      this.castTimer = Math.max(0, this.castTimer - delta);
      if (this.castTimer === 0) {
        this.setAnimation("idle");
      }
    } else {
      this.setAnimation(isMoving ? "run" : "idle");
    }

    const animation = this.animations[this.activeAnimation];
    if (animation) {
      animation.update(delta);
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
    const animation = this.animations[this.activeAnimation];
    if (!animation) return;
    const drawX = Math.round(this.position.x - (animation.frameWidth * animation.scale) / 2);
    const drawY = Math.round(this.position.y - animation.frameHeight * animation.scale + 6);
    animation.draw(ctx, drawX, drawY, this.direction, this.flip);
  }
}

class Enemy {
  constructor(x, y, sprite, hp = 24) {
    this.position = { x, y };
    this.sprite = sprite;
    this.hp = hp;
    this.radius = 18;
    this.direction = 0;
    this.flip = false;
  }

  update(delta) {
    this.sprite.update(delta);
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  isDead() {
    return this.hp <= 0;
  }

  render(ctx) {
    const drawX = Math.round(this.position.x - (this.sprite.frameWidth * this.sprite.scale) / 2);
    const drawY = Math.round(this.position.y - this.sprite.frameHeight * this.sprite.scale + 10);
    this.sprite.draw(ctx, drawX, drawY, this.direction, this.flip);
  }
}

class World {
  constructor(tileSize, tileset, assets) {
    this.tileSize = tileSize;
    this.width = 20;
    this.height = 12;
    this.biome = "Dark Forest";
    this.description = "Лес шепчет, а мох пьёт лунный свет.";
    this.tileset = tileset;
    this.assets = assets;
    this.tiles = this.generateTiles();
    this.decorations = this.generateDecorations();
    this.blockers = this.generateBlockers();
    this.clouds = this.generateClouds();
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

    for (let x = 3; x < 17; x += 1) {
      tiles[7][x] = "path";
    }
    for (let y = 2; y < 10; y += 1) {
      tiles[y][9] = "path";
    }
    for (let x = 6; x < 13; x += 1) {
      tiles[8][x] = "mud";
    }

    const waterCells = [
      [15, 3],
      [16, 3],
      [14, 4],
      [15, 4],
      [16, 4],
      [14, 5],
      [15, 5],
      [16, 5],
      [15, 6],
    ];
    waterCells.forEach(([x, y]) => {
      tiles[y][x] = "water";
    });

    return tiles;
  }

  generateDecorations() {
    return [
      { type: "house", x: 4, y: 8, imageKey: "house", scale: 0.5, block: { w: 70, h: 40 } },
      { type: "house", x: 6, y: 8, imageKey: "house2", scale: 0.5, block: { w: 70, h: 40 } },
      { type: "barracks", x: 2, y: 6, imageKey: "barracks", scale: 0.48, block: { w: 90, h: 50 } },
      { type: "archery", x: 8, y: 6, imageKey: "archery", scale: 0.48, block: { w: 80, h: 50 } },
      { type: "tower", x: 12, y: 5, imageKey: "tower", scale: 0.5, block: { w: 60, h: 60 } },
      { type: "castle", x: 10, y: 8, imageKey: "castle", scale: 0.45, block: { w: 110, h: 70 } },
      { type: "bush", x: 1, y: 2, imageKey: "bush1", scale: 0.6 },
      { type: "bush", x: 3, y: 2, imageKey: "bush2", scale: 0.6 },
      { type: "bush", x: 5, y: 2, imageKey: "bush3", scale: 0.6 },
      { type: "bush", x: 7, y: 2, imageKey: "bush4", scale: 0.6 },
      { type: "rock", x: 14, y: 2, imageKey: "rock1", scale: 0.55 },
      { type: "rock", x: 16, y: 2, imageKey: "rock2", scale: 0.55 },
      { type: "rock", x: 1, y: 10, imageKey: "rock3", scale: 0.55 },
      { type: "rock", x: 3, y: 10, imageKey: "rock4", scale: 0.55 },
      { type: "duck", x: 15, y: 5, imageKey: "rubberDuck", scale: 0.5 },
      { type: "water-rock", x: 14, y: 6, imageKey: "waterRock", scale: 0.5 },
    ];
  }

  generateClouds() {
    return [
      { x: 40, y: 10, imageKey: "cloud1", scale: 0.5, speed: 4 },
      { x: 260, y: 18, imageKey: "cloud2", scale: 0.45, speed: 5 },
      { x: 420, y: 6, imageKey: "cloud3", scale: 0.55, speed: 3 },
    ];
  }

  generateBlockers() {
    return this.decorations
      .filter((decor) => ["bush", "rock", "house", "barracks", "tower", "archery", "castle"].includes(decor.type))
      .map((decor) => {
        const base = { x: decor.x * this.tileSize, y: decor.y * this.tileSize };
        const block = decor.block || { w: 32, h: 20 };
        return {
          x: base.x + this.tileSize * 0.2,
          y: base.y + this.tileSize * 0.6,
          w: block.w,
          h: block.h,
        };
      });
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
      if (tile === "water") return true;
      return this.blockers.some((blocker) => {
        return (
          point.x >= blocker.x &&
          point.x <= blocker.x + blocker.w &&
          point.y >= blocker.y &&
          point.y <= blocker.y + blocker.h
        );
      });
    });
  }

  renderBase(ctx, time = 0) {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const tile = this.tiles[y][x];
        if (tile === "water") {
          const water = this.assets.waterTile;
          if (water) {
            ctx.drawImage(
              water,
              0,
              0,
              water.width,
              water.height,
              x * this.tileSize,
              y * this.tileSize,
              this.tileSize,
              this.tileSize
            );
            const foam = this.assets.waterFoam;
            if (foam) {
              const frameWidth = 64;
              const frameHeight = 64;
              const frames = Math.floor(foam.width / frameWidth);
              const frame = Math.floor((time / 120) % frames);
              ctx.drawImage(
                foam,
                frame * frameWidth,
                0,
                frameWidth,
                frameHeight,
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize
              );
            }
            continue;
          }
        }
        this.tileset.draw(ctx, tile, x * this.tileSize, y * this.tileSize);
      }
    }
  }

  renderDecorations(ctx, time = 0) {
    this.decorations.forEach((decor) => {
      const image = this.assets[decor.imageKey];
      if (!image) return;
      const x = decor.x * this.tileSize;
      const y = decor.y * this.tileSize;
      const scale = decor.scale || 1;
      const drawW = image.width * scale;
      const drawH = image.height * scale;
      const anchorX = drawW / 2;
      const anchorY = drawH;
      ctx.drawImage(image, x + this.tileSize / 2 - anchorX, y + this.tileSize - anchorY, drawW, drawH);
    });
  }

  renderClouds(ctx, time = 0) {
    this.clouds.forEach((cloud) => {
      const image = this.assets[cloud.imageKey];
      if (!image) return;
      const offsetX = (time * 0.01 * cloud.speed) % (this.tileSize * this.width + image.width);
      const x = cloud.x + offsetX - image.width;
      const drawW = image.width * cloud.scale;
      const drawH = image.height * cloud.scale;
      ctx.globalAlpha = 0.7;
      ctx.drawImage(image, x, cloud.y, drawW, drawH);
      ctx.globalAlpha = 1;
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
  constructor(assets) {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.root = document.getElementById("game-root");
    this.assets = assets;

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
    this.titlesOverlay = document.getElementById("titles");
    this.skipTitlesButton = document.getElementById("skip-titles");

    this.dialogue = new DialogueBox(document.getElementById("dialogue"));

    this.hud = {
      hp: document.getElementById("hp"),
      mana: document.getElementById("mana"),
      level: document.getElementById("level"),
      coins: document.getElementById("coins"),
    };

    this.input = new InputManager();
    this.tileSize = 32;
    this.tileset = new TileSet(this.assets.tilemap, this.tileSize, TILE_LOOKUP);
    this.playerAnimations = this.createPlayerAnimations();
    this.world = new World(this.tileSize, this.tileset, this.assets);
    this.player = new Player(this.tileSize * 4, this.tileSize * 4, this.playerAnimations);
    this.lastTimestamp = 0;
    this.isRunning = false;
    this.menuState = "main";
    this.attackRadius = 96;
    this.attackCooldown = 0.45;
    this.attackTimer = 0;
    this.attackEffects = [];
    this.titlesTimer = null;
    this.enemies = this.spawnEnemies();
    this.moveTarget = null;
    this.attackTarget = null;
    this.commandMarker = null;

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
    this.skipTitlesButton.addEventListener("click", () => this.hideTitles());

    this.canvas.addEventListener("click", (event) => {
      if (!this.isRunning) return;
      const { x, y } = this.getPointerPosition(event);
      this.handlePointerAction({ x, y });
    });

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
      const nearest = this.getNearestEnemy();
      if (nearest) {
        this.attackTarget = nearest;
        this.moveTarget = { ...nearest.position };
      }
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
    this.player = new Player(this.tileSize * 4, this.tileSize * 4, this.playerAnimations);
    this.world = new World(this.tileSize, this.tileset, this.assets);
    this.enemies = this.spawnEnemies();
    this.showMenu(false, "pause");
    this.showTitles();
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
      this.player = new Player(payload.player.x, payload.player.y, this.playerAnimations);
      this.player.stats = payload.stats;
      this.world = new World(this.tileSize, this.tileset, this.assets);
      this.world.biome = payload.biome || this.world.biome;
    } catch (error) {
      console.warn("Save corrupted", error);
    }
    this.showMenu(false, "pause");
    this.showTitles();
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

  showTitles() {
    clearTimeout(this.titlesTimer);
    this.titlesOverlay.classList.add("visible");
    this.titlesTimer = setTimeout(() => {
      this.hideTitles();
    }, 4000);
  }

  hideTitles() {
    clearTimeout(this.titlesTimer);
    this.titlesOverlay.classList.remove("visible");
  }

  createPlayerAnimations() {
    const frameWidth = 64;
    const frameHeight = 64;
    return {
      idle: new AnimatedSprite({
        image: this.assets.playerIdle,
        frameWidth,
        frameHeight,
        scale: 0.55,
        frameRate: 8,
      }),
      run: new AnimatedSprite({
        image: this.assets.playerRun,
        frameWidth,
        frameHeight,
        scale: 0.55,
        frameRate: 10,
      }),
      cast: new AnimatedSprite({
        image: this.assets.playerCast,
        frameWidth,
        frameHeight,
        scale: 0.55,
        frameRate: 10,
      }),
    };
  }

  createEnemySprite(image, scale = 0.55) {
    return new AnimatedSprite({
      image,
      frameWidth: 64,
      frameHeight: 64,
      scale,
      frameRate: 8,
    });
  }

  spawnEnemies() {
    return [
      new Enemy(this.tileSize * 16, this.tileSize * 2, this.createEnemySprite(this.assets.enemyArcher)),
      new Enemy(this.tileSize * 17, this.tileSize * 7, this.createEnemySprite(this.assets.enemyLancer, 0.6), 36),
      new Enemy(this.tileSize * 3, this.tileSize * 4, this.createEnemySprite(this.assets.enemyArcher), 28),
    ];
  }

  getPointerPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    return { x, y };
  }

  getEnemyAt(x, y) {
    return this.enemies.find((enemy) => {
      if (enemy.isDead()) return false;
      const dx = enemy.position.x - x;
      const dy = enemy.position.y - y;
      return Math.hypot(dx, dy) <= enemy.radius;
    });
  }

  getNearestEnemy() {
    const source = this.player.position;
    return this.enemies
      .filter((enemy) => !enemy.isDead())
      .map((enemy) => {
        const dx = enemy.position.x - source.x;
        const dy = enemy.position.y - source.y;
        return { enemy, distance: Math.hypot(dx, dy) };
      })
      .sort((a, b) => a.distance - b.distance)[0]?.enemy;
  }

  handlePointerAction(target) {
    const enemy = this.getEnemyAt(target.x, target.y);
    if (enemy) {
      this.attackTarget = enemy;
      this.moveTarget = { ...enemy.position };
      this.commandMarker = { x: enemy.position.x, y: enemy.position.y, type: "attack", timer: 0 };
      return;
    }
    this.attackTarget = null;
    this.moveTarget = { x: target.x, y: target.y };
    this.commandMarker = { x: target.x, y: target.y, type: "move", timer: 0 };
  }

  canAttack() {
    return this.attackTimer <= 0;
  }

  performAttack(enemy) {
    const target = enemy.position;
    this.attackEffects.push({
      x: target.x,
      y: target.y,
      timer: 0,
      imageKey: "explosion",
    });
    this.attackTimer = this.attackCooldown;
    this.player.setCast();
    enemy.takeDamage(this.player.stats.spellPower);
    if (enemy.isDead()) {
      this.player.stats.coins += 1;
    }
    this.attackTarget = null;
    this.moveTarget = null;
  }

  update(delta) {
    this.attackTimer = Math.max(0, this.attackTimer - delta);
    const axis = this.input.getAxis();
    let movement = axis;
    if (axis.x !== 0 || axis.y !== 0) {
      this.moveTarget = null;
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.player.position.x;
      const dy = this.moveTarget.y - this.player.position.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 4) {
        this.moveTarget = null;
        movement = { x: 0, y: 0 };
      } else {
        movement = { x: dx / distance, y: dy / distance };
      }
    }

    this.player.update(delta, movement, this.world);
    this.enemies.forEach((enemy) => enemy.update(delta));

    if (this.attackTarget && this.attackTarget.isDead()) {
      this.attackTarget = null;
    }

    if (this.attackTarget && !this.attackTarget.isDead()) {
      const dx = this.attackTarget.position.x - this.player.position.x;
      const dy = this.attackTarget.position.y - this.player.position.y;
      const distance = Math.hypot(dx, dy);
      if (distance > this.attackRadius) {
        this.moveTarget = { ...this.attackTarget.position };
      } else if (this.canAttack()) {
        this.performAttack(this.attackTarget);
      }
    }

    this.attackEffects.forEach((effect) => {
      effect.timer += delta;
    });
    this.attackEffects = this.attackEffects.filter((effect) => effect.timer < 0.6);
    if (this.commandMarker) {
      this.commandMarker.timer += delta;
      if (this.commandMarker.timer > 0.8) {
        this.commandMarker = null;
      }
    }
  }

  updateHud() {
    this.hud.hp.textContent = this.player.stats.hp;
    this.hud.mana.textContent = this.player.stats.mana;
    this.hud.level.textContent = this.player.stats.level;
    this.hud.coins.textContent = this.player.stats.coins;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.world.renderBase(this.ctx, this.lastTimestamp);
    this.world.renderClouds(this.ctx, this.lastTimestamp);
    this.world.renderDecorations(this.ctx, this.lastTimestamp);
    this.renderCommandMarker();
    this.enemies.forEach((enemy) => {
      if (!enemy.isDead()) {
        enemy.render(this.ctx);
      }
    });
    this.renderAttackRadius();
    this.renderAttackEffects();
    this.player.render(this.ctx);
    this.renderCastEffect();
  }

  renderAttackRadius() {
    const pulse = 0.6 + 0.2 * Math.sin(this.lastTimestamp * 0.006);
    this.ctx.strokeStyle = `rgba(140, 200, 160, ${pulse})`;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(
      Math.round(this.player.position.x),
      Math.round(this.player.position.y),
      this.attackRadius,
      0,
      Math.PI * 2
    );
    this.ctx.stroke();
  }

  renderAttackEffects() {
    this.attackEffects.forEach((effect) => {
      const alpha = 1 - effect.timer / 0.6;
      const radius = 6 + effect.timer * 20;
      const image = this.assets[effect.imageKey];
      if (image) {
        const size = 64 + effect.timer * 50;
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(image, effect.x - size / 2, effect.y - size / 2, size, size);
        this.ctx.globalAlpha = 1;
      } else {
        this.ctx.strokeStyle = `rgba(210, 230, 180, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    });
  }

  renderCommandMarker() {
    if (!this.commandMarker) return;
    const image = this.assets.cursor;
    if (!image) return;
    const alpha = 1 - this.commandMarker.timer / 0.8;
    const size = 32;
    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(
      image,
      this.commandMarker.x - size / 2,
      this.commandMarker.y - size / 2,
      size,
      size
    );
    this.ctx.globalAlpha = 1;
  }

  renderCastEffect() {
    if (this.player.castTimer <= 0) return;
    const image = this.assets.castEffect;
    if (!image) return;
    const size = 64;
    this.ctx.globalAlpha = 0.7;
    this.ctx.drawImage(
      image,
      this.player.position.x - size / 2,
      this.player.position.y - size / 2,
      size,
      size
    );
    this.ctx.globalAlpha = 1;
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
  loadAssets()
    .then((assets) => {
      new Game(assets);
    })
    .catch((error) => {
      console.error("Failed to load assets", error);
    });
});
