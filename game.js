// Mobile Roguelike Game - JavaScript Implementation

class Game {
  constructor() {
    this.boardSize = this.getBoardSize();
    this.board = [];
    this.rooms = [];
    this.player = {
      x: 0,
      y: 0,
      hp: 100,
      maxHP: 100,
      level: 1,
      xp: 0,
      xpToNext: 100,
      attack: 10,
      defense: 5,
    };
    this.enemies = [];
    this.items = [];
    this.currentFloor = 1;
    this.gameBoard = document.getElementById("gameBoard");
    this.messageLog = document.getElementById("messageLog");

    this.initializeGame();
    this.setupControls();
    this.updateDisplay();
  }

  getBoardSize() {
    const width = window.innerWidth;
    if (width < 768) return 20; // Mobile
    if (width < 1024) return 25; // Tablet
    return 30; // Desktop
  }

  initializeGame() {
    this.generateLevel();
    this.spawnPlayer();
    this.spawnEnemies();
    this.spawnItems();
    this.spawnStairs();
    this.renderBoard();
  }

  generateLevel() {
    // Initialize board with walls
    this.board = [];
    for (let y = 0; y < this.boardSize; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.boardSize; x++) {
        this.board[y][x] = "#"; // Wall
      }
    }

    this.rooms = [];
    const numRooms = 5 + Math.floor(Math.random() * 5);

    // Generate rooms
    for (let i = 0; i < numRooms; i++) {
      const room = this.generateRoom();
      if (room && !this.overlapsWithExistingRooms(room)) {
        this.rooms.push(room);
        this.carveRoom(room);
      }
    }

    // Connect rooms with corridors
    this.connectRooms();
  }

  generateRoom() {
    const minSize = 4;
    const maxSize = 8;
    const width = minSize + Math.floor(Math.random() * (maxSize - minSize));
    const height = minSize + Math.floor(Math.random() * (maxSize - minSize));
    const x = 1 + Math.floor(Math.random() * (this.boardSize - width - 2));
    const y = 1 + Math.floor(Math.random() * (this.boardSize - height - 2));

    return { x, y, width, height };
  }

  overlapsWithExistingRooms(newRoom) {
    return this.rooms.some((room) => {
      return !(
        newRoom.x + newRoom.width < room.x ||
        newRoom.x > room.x + room.width ||
        newRoom.y + newRoom.height < room.y ||
        newRoom.y > room.y + room.height
      );
    });
  }

  carveRoom(room) {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.board[y][x] = "."; // Floor
      }
    }
  }

  connectRooms() {
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const roomA = this.rooms[i];
      const roomB = this.rooms[i + 1];

      const centerA = {
        x: Math.floor(roomA.x + roomA.width / 2),
        y: Math.floor(roomA.y + roomA.height / 2),
      };
      const centerB = {
        x: Math.floor(roomB.x + roomB.width / 2),
        y: Math.floor(roomB.y + roomB.height / 2),
      };

      this.carveCorridor(centerA, centerB);
    }
  }

  carveCorridor(start, end) {
    let x = start.x;
    let y = start.y;

    // Horizontal then vertical
    while (x !== end.x) {
      this.board[y][x] = ".";
      x += x < end.x ? 1 : -1;
    }
    while (y !== end.y) {
      this.board[y][x] = ".";
      y += y < end.y ? 1 : -1;
    }
    this.board[y][x] = ".";
  }

  spawnPlayer() {
    if (this.rooms.length > 0) {
      const firstRoom = this.rooms[0];
      this.player.x = Math.floor(firstRoom.x + firstRoom.width / 2);
      this.player.y = Math.floor(firstRoom.y + firstRoom.height / 2);
    }
  }

  spawnEnemies() {
    this.enemies = [];
    const numEnemies = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numEnemies; i++) {
      const pos = this.getRandomFloorPosition();
      if (pos && (pos.x !== this.player.x || pos.y !== this.player.y)) {
        const enemy = {
          x: pos.x,
          y: pos.y,
          hp: 20 + this.currentFloor * 5,
          maxHP: 20 + this.currentFloor * 5,
          attack: 5 + this.currentFloor * 2,
          defense: 2 + this.currentFloor,
          type: this.getRandomEnemyType(),
          symbol: this.getEnemySymbol(),
        };
        this.enemies.push(enemy);
      }
    }
  }

  getRandomEnemyType() {
    const types = ["goblin", "orc", "skeleton", "spider"];
    return types[Math.floor(Math.random() * types.length)];
  }

  getEnemySymbol() {
    const symbols = ["G", "O", "S", "A"];
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  spawnItems() {
    this.items = [];
    const numItems = 2 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numItems; i++) {
      const pos = this.getRandomFloorPosition();
      if (pos && !this.isPositionOccupied(pos.x, pos.y)) {
        const item = {
          x: pos.x,
          y: pos.y,
          type: this.getRandomItemType(),
          symbol: this.getItemSymbol(),
        };
        this.items.push(item);
      }
    }
  }

  getRandomItemType() {
    const types = ["health", "weapon", "armor"];
    return types[Math.floor(Math.random() * types.length)];
  }

  getItemSymbol() {
    return "!";
  }

  spawnStairs() {
    const pos = this.getRandomFloorPosition();
    if (pos && !this.isPositionOccupied(pos.x, pos.y)) {
      this.stairs = { x: pos.x, y: pos.y };
    }
  }

  getRandomFloorPosition() {
    const attempts = 100;
    for (let i = 0; i < attempts; i++) {
      const x = Math.floor(Math.random() * this.boardSize);
      const y = Math.floor(Math.random() * this.boardSize);
      if (this.board[y] && this.board[y][x] === ".") {
        return { x, y };
      }
    }
    return null;
  }

  isPositionOccupied(x, y) {
    return (
      (this.player.x === x && this.player.y === y) ||
      this.enemies.some((enemy) => enemy.x === x && enemy.y === y) ||
      this.items.some((item) => item.x === x && item.y === y) ||
      (this.stairs && this.stairs.x === x && this.stairs.y === y)
    );
  }

  renderBoard() {
    this.gameBoard.innerHTML = "";
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
    this.gameBoard.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;

    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";

        // Determine what to display
        if (this.player.x === x && this.player.y === y) {
          cell.className += " player";
          cell.textContent = "@";
        } else {
          const enemy = this.enemies.find((e) => e.x === x && e.y === y);
          const item = this.items.find((i) => i.x === x && i.y === y);

          if (enemy) {
            cell.className += " enemy";
            cell.textContent = enemy.symbol;
          } else if (item) {
            cell.className += " item";
            cell.textContent = item.symbol;
          } else if (
            this.stairs &&
            this.stairs.x === x &&
            this.stairs.y === y
          ) {
            cell.className += " stairs";
            cell.textContent = ">";
          } else if (this.board[y][x] === "#") {
            cell.className += " wall";
            cell.textContent = "#";
          } else {
            cell.className += " floor";
            cell.textContent = ".";
          }
        }

        this.gameBoard.appendChild(cell);
      }
    }
  }

  setupControls() {
    // Gamepad controls
    this.setupGamepad();

    // Action button
    const actionBtn = document.getElementById("actionBtn");
    actionBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.performAction();
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          e.preventDefault();
          this.movePlayer("up");
          break;
        case "ArrowDown":
        case "s":
          e.preventDefault();
          this.movePlayer("down");
          break;
        case "ArrowLeft":
        case "a":
          e.preventDefault();
          this.movePlayer("left");
          break;
        case "ArrowRight":
        case "d":
          e.preventDefault();
          this.movePlayer("right");
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          this.performAction();
          break;
      }
    });
  }

  setupGamepad() {
    const dpadInner = document.getElementById("dpad-inner");
    const dpadStick = document.getElementById("dpad-stick");

    if (!dpadInner || !dpadStick) return;

    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let centerPos = { x: 0, y: 0 };
    let moveThreshold = 25; // Distance threshold for movement
    let lastMoveTime = 0;
    let moveDelay = 200; // Delay between moves in milliseconds

    // Get center position of the dpad
    const updateCenterPos = () => {
      const rect = dpadInner.getBoundingClientRect();
      centerPos.x = rect.left + rect.width / 2;
      centerPos.y = rect.top + rect.height / 2;
    };

    // Initialize center position
    updateCenterPos();
    window.addEventListener("resize", updateCenterPos);

    // Touch events
    const handleStart = (e) => {
      e.preventDefault();
      isDragging = true;

      const touch = e.touches ? e.touches[0] : e;
      startPos.x = touch.clientX;
      startPos.y = touch.clientY;

      dpadStick.classList.add("active");
      updateCenterPos();
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const touch = e.touches ? e.touches[0] : e;
      const deltaX = touch.clientX - centerPos.x;
      const deltaY = touch.clientY - centerPos.y;

      // Limit stick movement to circle boundary
      const maxDistance = 30; // Maximum stick movement from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      let finalX = deltaX;
      let finalY = deltaY;

      if (distance > maxDistance) {
        finalX = (deltaX / distance) * maxDistance;
        finalY = (deltaY / distance) * maxDistance;
      }

      // Update stick position
      dpadStick.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`;

      // Check for movement commands
      const now = Date.now();
      if (now - lastMoveTime > moveDelay && distance > moveThreshold) {
        const angle = Math.atan2(deltaY, deltaX);
        const direction = this.getDirectionFromAngle(angle);

        if (direction) {
          this.movePlayer(direction);
          lastMoveTime = now;
        }
      }
    };

    const handleEnd = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      isDragging = false;
      dpadStick.classList.remove("active");

      // Reset stick position
      dpadStick.style.transform = "translate(-50%, -50%)";
    };

    // Add event listeners for touch
    dpadInner.addEventListener("touchstart", handleStart, { passive: false });
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd, { passive: false });

    // Add event listeners for mouse (for desktop testing)
    dpadInner.addEventListener("mousedown", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
  }

  getDirectionFromAngle(angle) {
    // Convert radians to degrees and normalize
    let degrees = ((angle * 180) / Math.PI + 360) % 360;

    // Define direction ranges (45 degrees each)
    if (degrees >= 315 || degrees < 45) {
      return "right";
    } else if (degrees >= 45 && degrees < 135) {
      return "down";
    } else if (degrees >= 135 && degrees < 225) {
      return "left";
    } else if (degrees >= 225 && degrees < 315) {
      return "up";
    }

    return null;
  }

  movePlayer(direction) {
    let newX = this.player.x;
    let newY = this.player.y;

    switch (direction) {
      case "up":
        newY--;
        break;
      case "down":
        newY++;
        break;
      case "left":
        newX--;
        break;
      case "right":
        newX++;
        break;
    }

    // Check bounds
    if (
      newX < 0 ||
      newX >= this.boardSize ||
      newY < 0 ||
      newY >= this.boardSize
    ) {
      return;
    }

    // Check walls
    if (this.board[newY][newX] === "#") {
      return;
    }

    // Check for enemy
    const enemy = this.enemies.find((e) => e.x === newX && e.y === newY);
    if (enemy) {
      this.attackEnemy(enemy);
      return;
    }

    // Move player
    this.player.x = newX;
    this.player.y = newY;

    // Check for items
    const itemIndex = this.items.findIndex((i) => i.x === newX && i.y === newY);
    if (itemIndex >= 0) {
      this.collectItem(this.items[itemIndex]);
      this.items.splice(itemIndex, 1);
    }

    // Check for stairs
    if (this.stairs && this.stairs.x === newX && this.stairs.y === newY) {
      this.nextLevel();
      return;
    }

    // Enemy turn
    this.enemyTurn();

    this.renderBoard();
    this.updateDisplay();
  }

  attackEnemy(enemy) {
    const damage = Math.max(
      1,
      this.player.attack - enemy.defense + Math.floor(Math.random() * 5)
    );
    enemy.hp -= damage;

    this.addMessage(`You attack ${enemy.type} for ${damage} damage!`, "combat");

    if (enemy.hp <= 0) {
      const xpGain = 10 + this.currentFloor * 5;
      this.player.xp += xpGain;
      this.addMessage(
        `${enemy.type} defeated! You gain ${xpGain} XP.`,
        "combat"
      );

      // Remove enemy
      const index = this.enemies.indexOf(enemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }

      // Check level up
      this.checkLevelUp();
    } else {
      // Enemy attacks back
      const enemyDamage = Math.max(
        1,
        enemy.attack - this.player.defense + Math.floor(Math.random() * 3)
      );
      this.player.hp -= enemyDamage;
      this.addMessage(
        `${enemy.type} attacks you for ${enemyDamage} damage!`,
        "combat"
      );

      if (this.player.hp <= 0) {
        this.gameOver();
        return;
      }
    }

    // Enemy turn
    this.enemyTurn();

    this.renderBoard();
    this.updateDisplay();
  }

  collectItem(item) {
    switch (item.type) {
      case "health":
        const healAmount = 20 + Math.floor(Math.random() * 20);
        this.player.hp = Math.min(
          this.player.maxHP,
          this.player.hp + healAmount
        );
        this.addMessage(
          `You found a health potion! Healed ${healAmount} HP.`,
          "item"
        );
        break;
      case "weapon":
        this.player.attack += 2;
        this.addMessage("You found a weapon! Attack increased by 2.", "item");
        break;
      case "armor":
        this.player.defense += 1;
        this.addMessage("You found armor! Defense increased by 1.", "item");
        break;
    }
  }

  checkLevelUp() {
    if (this.player.xp >= this.player.xpToNext) {
      this.player.level++;
      this.player.xp -= this.player.xpToNext;
      this.player.xpToNext = Math.floor(this.player.xpToNext * 1.5);
      this.player.maxHP += 10;
      this.player.hp = this.player.maxHP;
      this.player.attack += 2;
      this.player.defense += 1;

      this.addMessage(
        `Level up! You are now level ${this.player.level}!`,
        "level"
      );
    }
  }

  enemyTurn() {
    this.enemies.forEach((enemy) => {
      // Simple AI: move towards player if adjacent, otherwise random movement
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.abs(dx) + Math.abs(dy);

      if (distance === 1) {
        // Attack player
        const damage = Math.max(
          1,
          enemy.attack - this.player.defense + Math.floor(Math.random() * 3)
        );
        this.player.hp -= damage;
        this.addMessage(
          `${enemy.type} attacks you for ${damage} damage!`,
          "combat"
        );

        if (this.player.hp <= 0) {
          this.gameOver();
        }
      } else if (distance <= 5) {
        // Move towards player
        let newX = enemy.x;
        let newY = enemy.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          newX += dx > 0 ? 1 : -1;
        } else {
          newY += dy > 0 ? 1 : -1;
        }

        // Check if movement is valid
        if (
          newX >= 0 &&
          newX < this.boardSize &&
          newY >= 0 &&
          newY < this.boardSize &&
          this.board[newY][newX] === "." &&
          !this.enemies.some((e) => e.x === newX && e.y === newY && e !== enemy)
        ) {
          enemy.x = newX;
          enemy.y = newY;
        }
      }
    });
  }

  performAction() {
    // Look for adjacent enemies or items
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (const dir of directions) {
      const checkX = this.player.x + dir.x;
      const checkY = this.player.y + dir.y;

      const enemy = this.enemies.find((e) => e.x === checkX && e.y === checkY);
      if (enemy) {
        this.attackEnemy(enemy);
        return;
      }
    }

    // If on stairs, go to next level
    if (
      this.stairs &&
      this.stairs.x === this.player.x &&
      this.stairs.y === this.player.y
    ) {
      this.nextLevel();
    } else {
      this.addMessage("Nothing to interact with here.");
    }
  }

  nextLevel() {
    this.currentFloor++;
    this.addMessage(`You descend to floor ${this.currentFloor}!`, "level");

    // Regenerate level
    this.enemies = [];
    this.items = [];
    this.generateLevel();
    this.spawnPlayer();
    this.spawnEnemies();
    this.spawnItems();
    this.spawnStairs();

    this.renderBoard();
    this.updateDisplay();
  }

  gameOver() {
    this.addMessage("You have died! Game Over.", "combat");
    setTimeout(() => {
      alert(
        `Game Over! You reached floor ${this.currentFloor} at level ${this.player.level}.`
      );
      location.reload();
    }, 1000);
  }

  updateDisplay() {
    document.getElementById("playerHP").textContent = this.player.hp;
    document.getElementById("playerMaxHP").textContent = this.player.maxHP;
    document.getElementById("playerLevel").textContent = this.player.level;
    document.getElementById("playerXP").textContent = this.player.xp;
    document.getElementById("currentFloor").textContent = this.currentFloor;
  }

  addMessage(message, type = "") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    this.messageLog.appendChild(messageDiv);
    this.messageLog.scrollTop = this.messageLog.scrollHeight;

    // Keep only last 50 messages
    while (this.messageLog.children.length > 50) {
      this.messageLog.removeChild(this.messageLog.firstChild);
    }
  }
}

// Handle window resize
window.addEventListener("resize", () => {
  // Debounce resize events
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    if (window.game) {
      const newSize = window.game.getBoardSize();
      if (newSize !== window.game.boardSize) {
        location.reload(); // Restart game with new board size
      }
    }
  }, 250);
});

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.game = new Game();
});

// Prevent zoom on double tap
document.addEventListener("touchstart", (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
});

let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);
