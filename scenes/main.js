const MOVE_SPEED = 150
const JOKE_SPEED = 200
const SELF_ESTEEM_LEFT = 65
var JOKE_EXISTS = false
var hecklers = 0
const HECKLE_SPEED = 50
const HECKLE_LIMIT = 2 // how many heckles can be simultaneously on screen
var currentHeckleAmount = 0 

const level1 = ([
  '            ',
  ' *   *  *** ',
  '  *** * **  ',
  ' **   * **  ',
  '  ****  *** ',
  ' *   * **** ',
  '            ',
  '            ',
  '============'
])

// Function to count the hecklers by iterating through
// each row in a level, and then iterating through each
// string that comprises the row, and counting '*'
for (let apple = 0; apple < level1.length; apple++) {
  console.log('current row: ' + level1[apple])
  for (let banana = 0; banana < level1[apple].length; banana++){
    console.log('character: ' + level1[apple][banana])
    if (level1[apple][banana] =='*') {
      hecklers++
      console.log(hecklers)
    }
  }
}




addLevel(level1, {
  width: 32, 
  height: 32,
  '*': [sprite('crowd'), scale(.70), 'heckler'],
  '=': [sprite('stage')],
})

const player = add([
  sprite('comic'),
  scale(1.5),
  pos(width()/2, height()-32),
  origin('center'),
])

const self_esteem = add([
  { value: SELF_ESTEEM_LEFT},
  text('Self Esteem: ' + SELF_ESTEEM_LEFT + '%'),
  pos(10,25),
  color(255,255,255)
])

const hecklerCount = add([
  text('Crowd: ' + hecklers),
  pos(10,10),
])

// TIME MANAGEMENT...
const timer = add([
  text('0'),
  pos(width() - 50, 0),
  {
    time: 0,
  },
])

timer.action(() => {
  timer.time += dt() //dt is a frame-related time element
  timer.text = timer.time.toFixed(2)
  if (timer.time.toFixed(0) % 5 == 0 && currentHeckleAmount < HECKLE_LIMIT) {
    spawnHeckle(width()/2, height()/2 - 100)
    currentHeckleAmount ++
  }
})

function bombed(s) {
  if (s < 1) {
    go('theLight', {self_esteem: self_esteem.value})
  }
}

// Takes in a delta AMOUNT and a CURRENT self_esteem level, and adjusts
// the current level by the amount.
// Then updates the display with new current level
function updateEsteem(amount, current) {
  self_esteem.value = current + amount
  self_esteem.text = 'Self Esteem: ' + self_esteem.value + '% '
}

//=================
// PROJECTILES
function spawnJoke(j) {
  add([rect(6,18),
  pos(j),
  origin('center'),
  color(100,100,100,.5),
  'joke',
  ])
}

function spawnHeckle(h) {
  add([sprite('heckle'),
  pos(rand(30, width()-30), rand(30, height()-150)), //randomize where it spawns
  origin('center'),
  'heckle'
  ])
}

action('heckle', (h) => {
  h.move(0, HECKLE_SPEED)
  if (h.pos.y > height() + 20) {
    destroy(h)
    updateEsteem(-5, self_esteem.value) // decrement self-esteem if heckles get by
    currentHeckleAmount-- // reduce the counter so more can be spawned
    bombed(self_esteem.value) // see if you lost
  }
})

//=================




//=================
//CONTROLS
keyDown('right', () => {
  if (player.pos.x < width()-45){
    player.move(MOVE_SPEED, 0)
  }
})

keyDown('left', () => {
  if (player.pos.x > 45){
    player.move(-MOVE_SPEED, 0)
  }
})

keyPress('space', () => {
  player.frame = 1; // change animation while pressed
  if (JOKE_EXISTS == false){ // if there isn't currently a joke..
    spawnJoke(player.pos.add(0,-45)) // spawn a joke
    JOKE_EXISTS = true // set to true so it doesn't keep spawning jokes
  }
})
action('joke', (j) => {
  j.move(0, -JOKE_SPEED)
  if (j.pos.y < 0) {
    destroy(j)
    JOKE_EXISTS = false // allow new joke to be spawned
    self_esteem.value -= 10
    self_esteem.text = 'Self Esteem: ' + self_esteem.value + '%'
    bombed(self_esteem.value) // return boolean for whether you've lost
  }
})
keyRelease('space', () => {
  player.frame = 0;
})


//============
//COLLISIONS


collides('joke','heckler', (j, h) => {
  // TODO:
  // Only do something if the crowd member is a heckler
  // Either eliminate or change color of heckler
  // Update score
  // Establish a WIN condition
  destroy(j)
  destroy(h)
  JOKE_EXISTS = false // lets you sling more jokes
  updateEsteem(1, self_esteem.value) // add 1 pnt to your self-esteem
  hecklers --
  hecklerCount.text = 'Crowd: ' + hecklers
  if (hecklers == 0) {
    go('win', {self_esteem: self_esteem.value})
  }
})

collides('joke', 'heckle', (j,h) => {
  destroy(j)
  destroy(h)
  JOKE_EXISTS = false
  currentHeckleAmount--
})