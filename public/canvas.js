let socket = io.connect('http://localhost:3000');
socket.on('news', data => {
  console.log(data);
  socket.emit('other event', { my: 'data' });
});

let vocab = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ':)',
  ':(',
  'triangle',
  '5star',
  'scribble'
];

let index = -1;
let sketch = document.querySelector('#sketch');
let canvasWidth = 150,
  canvasHeight = 150;

function clearDrawing() {
  var canvas = document.querySelector('#canvas');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function createCanvas(id) {
  let canvas,
    ctx,
    flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

  let x = 'black',
    y = 10;

  function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
  }

  function findxy(res, e) {
    let boundries = canvas.getBoundingClientRect();
    if (res == 'down') {
      prevX = currX;
      prevY = currY;
      currX = (e.clientX - boundries.left) * (canvas.width / boundries.width);
      currY = (e.clientY - boundries.top) * (canvas.height / boundries.height);

      flag = true;
      dot_flag = true;
      if (dot_flag) {
        ctx.beginPath();
        ctx.fillStyle = x;
        ctx.fillRect(currX, currY, 2, 2);
        ctx.closePath();
        dot_flag = false;
      }
    }
    if (res == 'up' || res == 'out') {
      flag = false;
    }
    if (res == 'move') {
      if (flag) {
        prevX = currX;
        prevY = currY;
        currX = (e.clientX - boundries.left) * (canvas.width / boundries.width);
        currY = (e.clientY - boundries.top) * (canvas.height / boundries.height);
        draw();
      }
    }
  }
  canvas = document.getElementById(id);
  ctx = canvas.getContext('2d');
  ctx.lineJoin = ctx.lineCap = 'round';
  w = canvasWidth;
  h = canvasHeight;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, w, h);

  canvas.addEventListener(
    'mousemove',
    function(e) {
      findxy('move', e);
    },
    false
  );
  canvas.addEventListener(
    'mousedown',
    function(e) {
      findxy('down', e);
    },
    false
  );
  canvas.addEventListener(
    'mouseup',
    function(e) {
      findxy('up', e);
    },
    false
  );
  canvas.addEventListener(
    'mouseout',
    function(e) {
      findxy('out', e);
    },
    false
  );
}

function generateNewEquation(n) {
  let equation = generateEquation(n, 10);
  let replace = getRandomPosition(equation);
  let replaceIdx = equation.indexOf(replace);

  let pre = '';
  let seq = '';
  for (let i = 0; i < replaceIdx; i++) {
    pre += equation[i];
  }

  for (let i = replaceIdx + replace.length; i < equation.length; i++) {
    seq += equation[i];
  }

  sketch.innerHTML = '';

  if (pre.length > 0) {
    preElement = document.createElement('span');
    preElement.id = 'equation';
    preElement.innerHTML = pre;
    sketch.appendChild(preElement);
  }

  let canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  sketch.appendChild(canvas);
  createCanvas(canvas.id);

  seqElement = document.createElement('span');
  seqElement.id = 'equation';
  seqElement.innerHTML = `${seq} = ${evaluatEquation(equation)}`;
  sketch.appendChild(seqElement);

  return { pre, seq, equation, replace };
}

let level = 0,
  wins = 0,
  losses = 0,
  chances = 2;

let equation, equationResult, userInputResult, sec, timer;
let noOfOperations = 2;

function updateScore(wins, losses, level, chances) {
  document.getElementById('wins').innerHTML = wins;
  document.getElementById('losses').innerHTML = losses;
  document.getElementById('level').innerHTML = level;
  document.getElementById('chances').innerHTML = chances;
}

function predictLoss() {
  console.log('You lost');
  losses++;
  chances--;
  if (!chances) {
    chances = 2;
    if (level) {
      level--;
      noOfOperations--;
      equation = generateNewEquation(noOfOperations);
    }
  }
}

updateScore(wins, losses, level, chances);

function startTimer() {
  sec = 15;
  equation = generateNewEquation(noOfOperations);
  timer = setInterval(() => {
    document.getElementById('timer').innerHTML = sec;
    sec--;
    if (sec < 0) {
      sec = 7;
      predictLoss();
      updateScore(wins, losses, level, chances);
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  startTimer();
}

function evaluateFinal(eq) {
  socket.on('minsta', data => {
    let userInput = 0;
    userInput = data.response;
    console.log(`user input ${userInput}`);

    console.log(eq.equation);
    console.log(eq.pre, userInput, eq.seq);
    equationResult = evaluatEquation(eq.equation);
    userInputResult = evaluatEquation(eq.pre + userInput + eq.seq);

    console.log(`actual result   ${equationResult}`);
    console.log(`User input result      ${userInputResult}`);

    if (userInputResult === equationResult) {
      wins++;
      if (wins % 3 === 0) {
        level++;
        noOfOperations++;
      }
    } else {
      predictLoss();
    }
    updateScore(wins, losses, level, chances);
    socket.off('minsta');
  });
}

function init() {
  startTimer();
  document.getElementById('evaluate').addEventListener('click', () => {
    clearInterval(timer);

    const canvas = document.querySelector('#canvas');
    imgURI = canvas.toDataURL('image/jpeg', 0.5);
    socket.emit('img', imgURI);

    evaluateFinal(equation);
    console.log('----------------------------------------');
    resetTimer();
  });
}
