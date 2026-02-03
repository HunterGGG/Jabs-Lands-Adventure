/* Jabs Lands Adventure - minimal prototype */

class InputManager {
  constructor() {
    this.keys = new Set();
    this.pointerActive = false;
    this.joystickVector = { x: 0, y: 0 };
    this.actionPressed = false;
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

class Player {
  constructor(x, y) {
    this.position = { x, y };
    this.speed = 120;
    this.size = 22;
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
    ctx.fillStyle = "#7fd36b";
    ctx.fillRect(
      Math.round(this.position.x - this.size / 2),
      Math.round(this.position.y - this.size / 2),
      this.size,
      this.size
    );
    ctx.fillStyle = "#1e261e";
    ctx.fillRect(
      Math.round(this.position.x - 4),
      Math.round(this.position.y - 8),
      3,
      3
    );
    ctx.fillRect(
      Math.round(this.position.x + 1),
      Math.round(this.position.y - 8),
      3,
      3
    );
  }
}

class World {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.width = 20;
    this.height = 11;
    this.biome = "Dark Forest";
    this.description = "Лес шепчет, а мох пьёт лунный свет.";
    this.tiles = this.generateTiles();
  }

  generateTiles() {
    const tiles = [];
    for (let y = 0; y < this.height; y += 1) {
      const row = [];
      for (let x = 0; x < this.width; x += 1) {
        const edge = x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1;
        row.push(edge ? 1 : 0);
      }
      tiles.push(row);
    }
    tiles[5][7] = 1;
    tiles[5][8] = 1;
    tiles[6][7] = 1;
    return tiles;
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
      return this.tiles[tileY][tileX] === 1;
    });
  }

  render(ctx) {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (this.tiles[y][x] === 1) {
          ctx.fillStyle = "#1c2b1e";
        } else {
          ctx.fillStyle = "#111a14";
        }
        ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }

    ctx.fillStyle = "#2e1f2f";
    ctx.fillRect(0, this.tileSize * (this.height - 1), this.tileSize * this.width, this.tileSize);
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.scale = 1;

    this.menu = document.getElementById("menu");
    this.newGameButton = document.getElementById("new-game");
    this.continueButton = document.getElementById("continue");
    this.exitButton = document.getElementById("exit");

    this.dialogue = document.getElementById("dialogue");
    this.dialogueText = document.getElementById("dialogue-text");
    this.dialogueOptions = document.getElementById("dialogue-options");

    this.hud = {
      hp: document.getElementById("hp"),
      mana: document.getElementById("mana"),
      level: document.getElementById("level"),
      coins: document.getElementById("coins"),
    };

    this.input = new InputManager();
    this.tileSize = 32;
    this.world = new World(this.tileSize);
    this.player = new Player(120, 120);
    this.lastTimestamp = 0;
    this.isRunning = false;
    this.descriptionShown = false;

    this.bindEvents();
    this.refreshContinueState();
    this.showMenu(true);
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
      this.flashMessage("Жаба выпускает тьму, но это ещё заготовка!");
    });

    document.getElementById("action-2").addEventListener("click", () => {
      this.flashMessage("В тени слышится шёпот — скоро здесь будет NPC.");
    });
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = rect.width / (this.tileSize * this.world.width);
    const scaleY = rect.height / (this.tileSize * this.world.height);
    this.scale = Math.min(scaleX, scaleY);
    this.canvas.width = Math.round(this.tileSize * this.world.width);
    this.canvas.height = Math.round(this.tileSize * this.world.height);
    this.ctx.imageSmoothingEnabled = false;
  }

  refreshContinueState() {
    const save = localStorage.getItem("jabs-save");
    this.continueButton.disabled = !save;
  }

  showMenu(visible) {
    this.menu.classList.toggle("visible", visible);
    this.isRunning = !visible;
    if (visible) {
      this.saveGame();
    } else {
      requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
  }

  toggleMenu() {
    this.showMenu(!this.menu.classList.contains("visible"));
  }

  startNewGame() {
    this.player = new Player(120, 120);
    this.world = new World(this.tileSize);
    this.descriptionShown = false;
    this.showMenu(false);
    this.flashMessage(`${this.world.description}`);
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
      this.player = new Player(payload.player.x, payload.player.y);
      this.player.stats = payload.stats;
      this.world = new World(this.tileSize);
      this.world.biome = payload.biome || this.world.biome;
    } catch (error) {
      console.warn("Save corrupted", error);
    }
    this.showMenu(false);
    this.flashMessage(`${this.world.description}`);
  }

  exitGame() {
    this.saveGame();
    this.flashMessage("Сохранение завершено. Возвращайся в сумрак.");
  }

  flashMessage(text) {
    this.dialogueText.textContent = text;
    this.dialogueOptions.innerHTML = "";
    this.dialogue.classList.add("visible");
    setTimeout(() => {
      this.dialogue.classList.remove("visible");
    }, 2400);
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
    this.world.render(this.ctx);
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
