function generateNumber(n) {
  return Math.floor(Math.random() * n);
}

function generateOperation() {
  return ['+', '-', '*'][Math.floor(Math.random() * 3)];
}

function generateEquation(n, x) {
  let equation = ``;
  for (let i = 0; i < n; i++) {
    equation += `${generateNumber(
      Math.floor(Math.random() * x)
    )} ${generateOperation()} `;
    if (i === n - 1) equation += `${generateNumber(Math.floor(Math.random() * x))}`;
  }
  return equation;
}

function evaluatEquation(exp) {
  return Function(`"use strict";return ${exp};`)();
}

function getRandomPosition(equation) {
  let res = [];
  let splittedEquation = equation.split(' ');
  for (let i = 0; i < splittedEquation.length; i += 2) {
    res.push(splittedEquation[i]);
  }
  return res[Math.floor(Math.random() * res.length)];
}
