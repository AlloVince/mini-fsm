# mini-fsm - A js/NodeJs minimum Finite State Machine (FSM)


[![NPM version](https://img.shields.io/npm/v/mini-fsm.svg?style=flat-square)](http://badge.fury.io/js/mini-fsm)
[![Build Status](https://travis-ci.org/AlloVince/mini-fsm.svg?branch=master)](https://travis-ci.org/AlloVince/mini-fsm)
[![Dependencies Status](https://david-dm.org/AlloVince/mini-fsm.svg)](https://david-dm.org/AlloVince/mini-fsm)
[![codecov](https://codecov.io/gh/AlloVince/mini-fsm/branch/master/graph/badge.svg)](https://codecov.io/gh/AlloVince/mini-fsm)
[![npm](https://img.shields.io/npm/dm/AlloVince.svg?maxAge=2592000)](https://www.npmjs.com/package/mini-fsm)
[![License](https://img.shields.io/npm/l/mini-fsm.svg?maxAge=2592000?style=plastic)](https://github.com/AlloVince/mini-fsm/blob/master/LICENSE)

## Features

- Minimalism, just a single file without any dependency
- Semantics, pure ES6 class based, a fsm is a class definition
- Callbacks support Promise & ES7 async/await


## Quick Start

NodeJS version require >= v6

In Node.js you can install mini-fsm with npm:

``` shell
npm install mini-fsm
```

A state machine can be defined as a class contains states and transitions, 
let's create an FSM to represent how traffic light works.

First we should define a fsm as bellow:

``` js
import FiniteStateMachine from 'mini-fsm';

export default class TrafficLightFsm extends FiniteStateMachine {
  get states() {
    return {
      'green': {},
      'yellow': {},
      'red': {}
    };
  }

  get transitions() {
    return {
      turnYellow: { from: 'green', to: 'yellow' },
      turnRed: { from: 'yellow', to: 'red' },
      turnGreen: { from: 'red', to: 'green' }
    };
  }
}
```

Then create a traffic light and make it work:

``` js
const light = new TrafficLightFsm('green'); //initial state is green
console.log(light.getCurrentState()); //output 'green'
(async () => {
  await light.do().turnYellow();
  console.log(light.getCurrentState()); //output 'yellow'
  await light.do().turnRed();
  console.log(light.getCurrentState()); //output 'red'
  await light.do().turnGreen();
  console.log(light.getCurrentState()); //output 'green'
})();
```

If state transfer not as expected, an Error will be throw:

``` js
const light = new TrafficLightFsm('green');
(async () => {
  try {
    await light.do().turnRed();
  } catch (e) {
    console.error(e.message); //output 'Error: Transition from green to red denied'
  }
})();
```