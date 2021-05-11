const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const cellSize = 100
const cellGap = 3
let numberOfResources = 275
let enemiesInterval = 600
let frame = 0
let gameOver = false
let score = 0
const winningScore = 50
let chosenDefender = 1

const gameGrid = []
const defenders = []
const enemies = []
const enemyPositions = []
const projectiles = []
const resources = []

const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
  clicked: false,
}
canvas.addEventListener('mousedown', function () {
  mouse.clicked = true
})
canvas.addEventListener('mouseup', function () {
  mouse.clicked = false
})
let canvasPosition = canvas.getBoundingClientRect()
canvas.addEventListener('mousemove', function (e) {
  mouse.x = e.x - canvasPosition.left
  mouse.y = e.y - canvasPosition.top
})
canvas.addEventListener('mouseleave', function (e) {
  mouse.x = undefined
  mouse.y = undefined
})

const controlBar = {
  width: canvas.width,
  height: cellSize,
}
class Cell {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = cellSize
    this.height = cellSize
  }
  draw() {
    if (mouse.x && mouse.y && isColliding(this, mouse)) {
      context.fillStyle = 'rgba(44, 130, 201, 0.3)'
      context.fillRect(this.x, this.y, this.width, this.height)
    }
  }
}
function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y))
    }
  }
}
createGrid()
function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw()
  }
}

const bullet = new Image()
bullet.src = 'assets/bullet.png'
class Projectiles {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 30
    this.height = 8
    this.power = 13
    this.speed = 10
  }
  update() {
    this.x += this.speed
  }
  draw() {
    context.drawImage(
      bullet,
      0,
      0,
      256,
      46,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update()
    projectiles[i].draw()

    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        isColliding(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].power
        projectiles.splice(i, 1)
        i--
      }
    }

    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1)
      i--
    }
  }
}

const defender1 = new Image()
defender1.src = 'assets/defender1.png'
const defender2 = new Image()
defender2.src = 'assets/defender2.png'
const defender3 = new Image()
defender3.src = 'assets/defender3.png'

class Defender {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = cellSize - cellGap * 2
    this.height = cellSize - cellGap * 2
    this.shooting = false
    this.shootNow = false
    this.health = 100
    this.projectiles = []
    this.timer = 0
    this.frameX = 0
    this.frameY = 0
    this.spriteWidth = 140
    this.spriteHeight = 140
    this.minFrame = 0
    this.maxFrame = 7
    this.chosenDefender = chosenDefender
  }
  update() {
    if (frame % 8 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
      if (this.frameX === 5) this.shootNow = true
    }
    if (this.shooting) {
      this.minFrame = 0
      this.maxFrame = 7
    } else {
      this.minFrame = 0
      this.maxFrame = 0
    }
    if (this.shooting && this.shootNow) {
      projectiles.push(new Projectiles(this.x + 50, this.y + 25))
      this.shootNow = false
    }
  }
  draw() {
    context.fillStyle = 'green'
    context.font = '10px Orbitron'
    context.fillText(Math.floor(this.health) + '%', this.x + 30, this.y + 10)
    if (this.chosenDefender === 1) {
      context.drawImage(
        defender1,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    } else if (this.chosenDefender === 2) {
      context.drawImage(
        defender2,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    } else if (this.chosenDefender === 3) {
      context.drawImage(
        defender3,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    }
  }
}
function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw()
    defenders[i].update()
    if (
      enemyPositions.indexOf(defenders[i].y) !== -1 ||
      enemyPositions.indexOf(200) !== -1
    ) {
      defenders[i].shooting = true
    } else {
      defenders[i].shooting = false
    }
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && isColliding(defenders[i], enemies[j])) {
        enemies[j].movement = 0
        defenders[i].health -= 0.2
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1)
        i--
        enemies[j].movement = enemies[j].speed
      }
    }
  }
}
const card1 = {
  x: canvas.width - 90,
  y: 10,
  width: 70,
  height: 85,
}
const card2 = {
  x: canvas.width - 180,
  y: 10,
  width: 70,
  height: 85,
}
const card3 = {
  x: canvas.width - 270,
  y: 10,
  width: 70,
  height: 85,
}

function chooseDefender() {
  let card1stroke = 'green'
  let card2stroke = 'black'
  let card3stroke = 'black'
  if (isColliding(mouse, card1) && mouse.clicked) {
    chosenDefender = 1
  } else if (isColliding(mouse, card2) && mouse.clicked) {
    chosenDefender = 2
  } else if (isColliding(mouse, card3) && mouse.clicked) {
    chosenDefender = 3
  }
  if (chosenDefender === 1) {
    card1stroke = 'green'
    card2stroke = 'black'
    card3stroke = 'black'
  } else if (chosenDefender === 2) {
    card1stroke = 'black'
    card2stroke = 'green'
    card3stroke = 'black'
  } else if (chosenDefender === 3) {
    card1stroke = 'black'
    card2stroke = 'black'
    card3stroke = 'green'
  } else {
    card1stroke = 'black'
    card2stroke = 'black'
    card3stroke = 'black'
  }
  context.lineWidth = 1
  context.fillStyle = 'rgba(0,0,0,0.2)'
  context.fillRect(card1.x, card1.y, card1.width, card1.height)
  context.strokeStyle = card1stroke
  context.strokeRect(card1.x, card1.y, card1.width, card1.height)
  context.drawImage(
    defender1,
    0,
    0,
    140,
    140,
    card1.x,
    card1.y,
    140 / 2,
    140 / 2
  )
  context.fillRect(card2.x, card2.y, card2.width, card2.height)
  context.drawImage(
    defender2,
    0,
    0,
    140,
    140,
    card2.x,
    card2.y,
    140 / 2,
    140 / 2
  )
  context.strokeStyle = card2stroke
  context.strokeRect(card2.x, card2.y, card2.width, card2.height)
  context.fillRect(card3.x, card3.y, card3.width, card3.height)
  context.drawImage(
    defender3,
    0,
    0,
    140,
    140,
    card3.x,
    card3.y,
    140 / 2,
    140 / 2
  )
  context.strokeStyle = card3stroke
  context.strokeRect(card3.x, card3.y, card3.width, card3.height)
}

const floatingMessages = []
class FloatingMessage {
  constructor(value, x, y, size, color) {
    this.value = value
    this.x = x
    this.y = y
    this.size = size
    this.lifeSpan = 0
    this.color = color
    this.opacity = 1
  }
  update() {
    this.y -= 0.3
    this.lifeSpan += 1
    if (this.opacity > 0.03) this.opacity -= 0.03
  }
  draw() {
    context.globalAlpha = this.opacity
    context.fillStyle = this.color
    context.font = this.size + 'px Orbitron'
    context.fillText(this.value, this.x, this.y)
    context.globalAlpha = 1
  }
}
function handlFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update()
    floatingMessages[i].draw()
    if (floatingMessages[i].lifeSpan >= 70) {
      floatingMessages.splice(i, 1)
      i--
    }
  }
}

const enemyTypes = []
const enemy1 = new Image()
enemy1.src = 'assets/enemy1.png'
enemyTypes.push(enemy1)
const enemy2 = new Image()
enemy2.src = 'assets/enemy2.png'
enemyTypes.push(enemy2)
const enemy3 = new Image()
enemy3.src = 'assets/enemy3.png'
enemyTypes.push(enemy3)
const enemy4 = new Image()
enemy4.src = 'assets/enemy4.png'
enemyTypes.push(enemy4)

class Enemy {
  constructor(verticalPosition) {
    this.x = canvas.width
    this.y = verticalPosition
    this.width = cellSize - cellGap * 2
    this.height = cellSize - cellGap * 2
    this.speed = Math.random() * 0.2 + 1.5
    this.movement = this.speed
    this.health = 100
    this.maxHealth = this.health
    this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
    this.frameX = 0
    this.frameY = 0
    this.minFrame = 0
    this.maxFrame = 1
    this.spriteWidth = 256
    this.spriteHeight = 256
  }
  update() {
    this.x -= this.movement
    if (frame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }
  }
  draw() {
    context.fillStyle = 'red'
    context.font = '10px Orbitron'
    context.fillText(Math.floor(this.health) + '%', this.x + 25, this.y + 10)
    context.drawImage(
      this.enemyType,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}

const boss = new Image()
boss.src = 'assets/boss.png'

class Boss {
  constructor(verticalPosition) {
    this.x = canvas.width
    this.y = verticalPosition
    this.width = 640
    this.height = 480
    this.speed = Math.random() * 0.2 + 0.8
    this.movement = this.speed
    this.health = 2626
    this.maxHealth = this.health
    this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
    this.frameX = 0
    this.frameY = 0
    this.minFrame = 0
    this.maxFrame = 7
    this.spriteWidth = 640
    this.spriteHeight = 448
  }
  update() {
    this.x -= this.movement
    if (frame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }
  }
  draw() {
    context.fillStyle = 'red'
    context.font = '30px Orbitron'
    context.fillText(
      Math.floor(this.health) + ' HP',
      this.x + 300,
      this.y + 200
    )
    context.drawImage(
      boss,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}
function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update()
    enemies[i].draw()
    if (enemies[i].x < 0) {
      gameOver = true
    }
    if (enemies[i].health <= 0) {
      let gainedResources = enemies[i].maxHealth / 10
      floatingMessages.push(
        new FloatingMessage(
          '+' + gainedResources,
          enemies[i].x,
          enemies[i].y,
          30,
          'green'
        )
      )
      floatingMessages.push(
        new FloatingMessage('+' + gainedResources, 300, 85, 30, 'green')
      )
      numberOfResources += gainedResources
      score += gainedResources
      const findIndex = enemyPositions.indexOf(enemies[i].y)
      enemyPositions.splice(findIndex, 1)
      enemies.splice(i, 1)
      i--
    }
  }
  if (frame % enemiesInterval === 0 && score < winningScore) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGap
    enemies.push(new Enemy(verticalPosition))
    enemyPositions.push(verticalPosition)
    if (enemiesInterval > 120) enemiesInterval -= 100
  }
}

const coin = new Image()
coin.src = 'assets/coin.png'

const amounts = [20, 30, 40]
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize)
    this.y = Math.floor(Math.random() * 5 + 1) * cellSize + 25
    this.width = cellSize * 0.6
    this.height = cellSize * 0.6
    this.amount = amounts[Math.floor(Math.random() * amounts.length)]
    this.frameX = 0
    this.frameY = 0
    this.minFrame = 0
    this.maxFrame = 3
    this.spriteWidth = 256
    this.spriteHeight = 256
  }
  update() {
    if (frame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }
  }
  draw() {
    context.drawImage(
      coin,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}
function handleResources() {
  if (frame % 500 === 0 && score < winningScore) {
    resources.push(new Resource())
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].update()
    resources[i].draw()
    if (
      resources[i] &&
      mouse.x &&
      mouse.y &&
      isColliding(resources[i], mouse)
    ) {
      numberOfResources += resources[i].amount
      floatingMessages.push(
        new FloatingMessage(
          '+' + resources[i].amount,
          resources[i].x + 15,
          resources[i].y,
          30,
          'green'
        )
      )
      floatingMessages.push(
        new FloatingMessage('+' + resources[i].amount, 300, 85, 30, 'green')
      )
      resources.splice(i, 1)
      i--
    }
  }
}

function handleGameStatus() {
  context.fillStyle = 'gold'
  context.font = '30px Orbitron'
  context.fillText('Score: ' + score, 20, 40)
  context.fillText('Resources: ' + numberOfResources, 20, 80)
  if (gameOver) {
    for (let i = 0; i < enemies.length; i++) enemies[i].health = 0
    for (let i = 0; i < defenders.length; i++) defenders[i].health = 0
    context.fillStyle = 'red'
    context.font = '80px Orbitron'
    context.fillText('THE WAR IS LOST', 300, 330)
  }
  if (score === 70) {
    for (let i = 0; i < enemies.length; i++) enemies[i].health = 0
    for (let i = 0; i < defenders.length; i++) defenders[i].health = 0
    chosenDefender = 3
    numberOfResources = 575
    enemies.push(new Boss(200))
    enemyPositions.push(200)
    floatingMessages.push(
      new FloatingMessage('ALIENS INVASION', 300, 330, 60, 'orange')
    )
  } else if (score >= winningScore && enemies.length === 0) {
    for (let i = 0; i < defenders.length; i++) defenders[i].health = 0

    context.fillStyle = 'green'
    context.font = '60px Orbitron'
    context.fillText('THE WAR IS WON', 320, 330)
  }
}

canvas.addEventListener('click', function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap
  if (gridPositionY < cellSize) return
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return
  }
  let defenderCost = 100
  if (numberOfResources >= defenderCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY))
    numberOfResources -= defenderCost
  } else {
    floatingMessages.push(
      new FloatingMessage('not enough resources', mouse.x, mouse.y, 15, 'red')
    )
  }
})

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  handleGameGrid()
  handleDefenders()
  handleResources()
  handleProjectiles()
  handleEnemies()
  chooseDefender()
  handleGameStatus()
  handlFloatingMessages()
  frame++
  if (!gameOver) requestAnimationFrame(animate)
}
animate()

function isColliding(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true
  }
}

window.addEventListener('resize', function () {
  canvasPosition = canvas.getBoundingClientRect()
})
