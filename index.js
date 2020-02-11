class Game {
  constructor() {
    this.restart()
  }

  get level() {
    return Math.floor(this.lines * 0.05) + 1;
  }

  createBlock() {
    let index = Math.floor(Math.random() * 7);
    let block = {};
    let arr = [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 2, 0],
        [0, 2, 0],
        [0, 2, 2]
      ],
      [
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0]
      ],
      [
        [4, 4, 0],
        [0, 4, 4],
        [0, 0, 0]
      ],
      [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
      ],
      [
        [0, 6, 6],
        [0, 6, 6],
        [0, 0, 0]
      ],
      [
        [0, 7, 0, 0],
        [0, 7, 0, 0],
        [0, 7, 0, 0],
        [0, 7, 0, 0]
      ],
    ]
    block.blocks = arr[index];
    block.x = Math.floor((10 - block.blocks[0].length) / 2);
    block.y = 0;
    return block;
  }
  restart() {
    this.score = 0
    this.lines = 0
    this.playfield = this.createPlayfield()
    this.nextBlock = this.createBlock()
    this.blockPart = this.createBlock()
    this.topOut = false
  }


  moveBlockLeft() {
    this.blockPart.x -= 1;
    if (this.isTouchingAnywhere()) {
      this.blockPart.x += 1
    }
  }

  moveBlockRight() {
    this.blockPart.x += 1
    if (this.isTouchingAnywhere()) {
      this.blockPart.x -= 1;
    }
  }
  moveBlockDown() {
    if (this.topOut) {
      return
    }
    this.blockPart.y += 1
    if (this.isTouchingAnywhere()) {
      this.blockPart.y -= 1;
      this.insertBlock();
      let deletedLines = this.deleteLines();
      this.updateScore(deletedLines);
      this.updateBlock();
    }
    if (this.isTouchingAnywhere()) {
      this.topOut = true;
    }
  }


  isTouchingAnywhere() {
    let blockX = this.blockPart.x;
    let blockY = this.blockPart.y;
    let playfield = this.playfield;
    let block = this.blockPart.blocks;
    for (let y = 0; y < block.length; y++) {
      for (let x = 0; x < block[y].length; x++) {
        if (
          block[y][x] &&
          ((playfield[blockY + y] === undefined || playfield[blockY + y][blockX + x] === undefined) ||
            playfield[blockY + y][blockX + x])
        ) {
          return true
        }
      }
    }
    return false
  }

  insertBlock() {
    let blockX = this.blockPart.x;
    let blockY = this.blockPart.y;
    let playfield = this.playfield;
    let block = this.blockPart.blocks;
    for (let y = 0; y < block.length; y++) {
      for (let x = 0; x < block[y].length; x++) {
        if (block[y][x]) {
          playfield[blockY + y][blockX + x] = block[y][x]
        }
      }
    }
  }

  deleteLines() {
    let rows = 20;
    let columns = 10;
    let lines = [];
    for (let y = rows - 1; y >= 0; y--) {
      let lineCount = 0;
      for (let x = 0; x < columns; x++) {
        if (this.playfield[y][x]) {
          lineCount += 1
        }
      }
      if (lineCount === 0) {
        break;
      } else if (lineCount < columns) {
        continue;
      } else {
        lines.unshift(y)
      }
    }
    for (let line of lines) {
      this.playfield.splice(line, 1);
      this.playfield.unshift(new Array(columns).fill(0))
    }
    return lines.length;
  }


  updateScore(deletedLines) {
    if (deletedLines > 0) {
      this.score += (10 * deletedLines * deletedLines);
      this.lines += deletedLines;
    }

  }


  rotateBlock() {
    let newArr = [],
      newInArr = [],
      current = this.blockPart.blocks;

    for (let i = 0; i < current.length; i++) {
      for (let j = 0; j < current[i].length; j++) {
        newInArr.push(current[current.length - 1 - j][i])
      }
      newArr[i] = newInArr;
      newInArr = [];
    }
    this.blockPart.blocks = newArr;
    if (this.isTouchingAnywhere()) {
      this.blockPart.blocks = current
    }
  }


  getState() {
    let playfield = [];
    for (let y = 0; y < this.playfield.length; y++) {
      playfield[y] = [];
      for (let x = 0; x < this.playfield[y].length; x++) {
        playfield[y][x] = this.playfield[y][x];
      }
    }
    for (let y = 0; y < this.blockPart.blocks.length; y++) {
      for (let x = 0; x < this.blockPart.blocks[y].length; x++) {
        if (this.blockPart.blocks[y][x]) {
          playfield[this.blockPart.y + y][this.blockPart.x + x] = this.blockPart.blocks[y][x];
        }
      }
    }

    return {
      score: this.score,
      level: this.level,
      lines: this.lines,
      nextBlock: this.nextBlock,
      playfield,
      isGetToTop: this.topOut
    }

  }

  createPlayfield() {
    let playfield = [];
    for (let i = 0; i < 20; i++) {
      playfield[i] = [];
      for (let j = 0; j < 10; j++) {
        playfield[i][j] = 0;
      }
    }
    return playfield
  }
  updateBlock() {
    this.blockPart = this.nextBlock;
    this.nextBlock = this.createBlock();
  }


}


class Interface {
  constructor(width, height, rows, columns) {
    this.width = width;
    this.height = height;
    this.rows = rows;
    this.columns = columns;

    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.blockWidth = this.width / this.columns;
    this.blockHeight = this.height / this.rows;

    this.playfieldBorderWidth = 4;
    this.playfieldX = this.playfieldBorderWidth;
    this.playfieldY = this.playfieldBorderWidth;
    this.playfieldWidth = this.width * 2 / 3;
    this.playfieldHeight = this.height;
    this.playfieldInnerWidth = this.playfieldWidth - this.playfieldBorderWidth * 2;
    this.playfieldInnerHeight = this.playfieldHeight - this.playfieldBorderWidth * 2;

    this.blockWidth = this.playfieldInnerWidth / this.columns;
    this.blockHeight = this.playfieldInnerHeight / this.rows;

    this.panelX = this.playfieldWidth + 10;
    this.panelY = 0;
    this.panelWidth = this.width / 3;
    this.panelHeight = this.height;

  }
  colors = {
    '1': 'cyan',
    '2': 'blue',
    '3': 'orange',
    '4': 'yellow',
    '5': 'green',
    '6': 'purple',
    '7': 'red'
  }


  paintOnCanvas(data) {
    this.clearScreen();
    this.paintOnPlayfield(data);
    this.paintOnPanel(data)
  }

  clearScreen() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  paintBlock(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(x, y, width, height)
    this.ctx.strokeRect(x, y, width, height)
  }

  paintOnPlayfield({
    playfield
  }) {
    for (let y = 0; y < playfield.length; y++) {
      for (let x = 0; x < playfield[y].length; x++) {
        if (playfield[y][x]) {
          this.paintBlock(
            this.playfieldX + (x * this.blockWidth),
            this.playfieldY + (y * this.blockHeight),
            this.blockWidth,
            this.blockHeight,
            this.colors[playfield[y][x]]
          )
        }
      }
    }

    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = this.playfieldBorderWidth;
    this.ctx.strokeRect(0, 0, this.playfieldWidth, this.playfieldHeight);

  }

  paintStartScreen() {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'black';
    this.ctx.font = '25px "Georgia"';
    this.ctx.fillText('Press ENTER to Start!', this.width / 2, this.height / 2)
  }

  paintPauseScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'yellow';
    this.ctx.font = '25px "Georgia"';
    this.ctx.fillText('Press ENTER to Resume!', this.width / 2, this.height / 2)
  }

  paintGameOver({
    score
  }) {
    this.clearScreen()
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'yellow';
    this.ctx.font = '25px "Georgia"';
    this.ctx.fillText('Game Over!!!', this.width / 2, this.height / 2 - 50)
    this.ctx.fillText(`Your score is: ${score}`, this.width / 2, this.height / 2)
    this.ctx.fillText(`Press ENTER to Restart`, this.width / 2, this.height / 2 + 50)
  }

  paintOnPanel({
    level,
    score,
    lines,
    nextBlock
  }) {
    this.ctx.textAlign = 'start';
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = 'black';
    this.ctx.font = '25px "Georgia"';


    this.ctx.fillText(`Score: ${score}`, this.panelX, this.panelY + 0)
    this.ctx.fillText(`Lines: ${lines}`, this.panelX, this.panelY + 25)
    this.ctx.fillText(`Level: ${level}`, this.panelX, this.panelY + 50)
    this.ctx.fillText(`Next: `, this.panelX, this.panelY + 75)
    for (let y = 0; y < nextBlock.blocks.length; y++) {
      for (let x = 0; x < nextBlock.blocks[y].length; x++) {
        let block = nextBlock.blocks[y][x]
        if (nextBlock.blocks[y][x]) {
          this.paintBlock(
            this.panelX + 20 + (x * this.blockWidth / 2),
            this.panelY + 110 + (y * this.blockHeight / 2),
            this.blockWidth / 2,
            this.blockHeight / 2,
            this.colors[nextBlock.blocks[y][x]]
          )
        }
      }
    }
  }
}


class Control {
  constructor(game, interfaceе) {
    this.game = game;
    this.interface = interfaceе;
    this.intervalID = null;
    this.isPlaying = false;
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    this.interface.paintStartScreen();
  }
  play() {
    this.isPlaying = true;
    this.startTimer();
    this.mainInterface()
  }
  pause() {
    this.isPlaying = false;
    this.stopTimer();
    this.mainInterface()
  }
  restart() {
    this.game.restart()
    this.play();
  }

  startTimer() {
    let speed = 1100 - this.game.getState().level * 100
    if (!this.intervalID) {
      this.intervalID = setInterval(() => {
        this.main();
      }, speed > 0 ? speed : 100)
    }
    return speed;
  }
  main() {
    game.moveBlockDown();
    this.mainInterface()
  }
  mainInterface() {
    let state = this.game.getState()
    if (state.isGetToTop) {
      this.interface.paintGameOver(state)
    } else if (!this.isPlaying) {
      this.interface.paintPauseScreen();
    } else {
      this.interface.paintOnCanvas(game.getState());
    }

  }
  stopTimer() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  }

  onKeyDown(event) {
    let state = this.game.getState()
    switch (event.keyCode) {
      case 13:
        if (state.isGetToTop) {
          this.restart();
        } else if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
        break;
      case 37:
        this.game.moveBlockLeft();
        this.mainInterface()
        break;
      case 38:
        this.game.rotateBlock();
        this.mainInterface()
        break;
      case 39:
        this.game.moveBlockRight();
        this.mainInterface()
        break;
      case 40:
        this.game.moveBlockDown();
        this.mainInterface()
        break;
    }
  }
}

let game = new Game();
let interface = new Interface(480, 640, 20, 10);
let control = new Control(game, interface)



window.game = game;
window.interface = interface;
window.control = control;