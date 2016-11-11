# mini-fsm - A js/nodejs minimum Finite State Machine (FSM)

## Features

- Minimalism, just a single file without any dependency
- Semantics, pure ES6 class based, a fsm is a class definition
- Callbacks support Promise & ES7 async/await


## Quick Start

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
    console.error(e.message); //output ''
  }
})();
```