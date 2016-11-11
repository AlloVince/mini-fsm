import FiniteStateMachine from './../lib';

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


const light = new TrafficLightFsm('green'); //initial state is green
console.log(light.getCurrentState()); //output 'green'
(async() => {
  await light.do().turnYellow();
  console.log(light.getCurrentState()); //output 'yellow'
  await light.do().turnRed();
  console.log(light.getCurrentState()); //output 'red'
  await light.do().turnGreen();
  console.log(light.getCurrentState()); //output 'green'

  try {
    await light.do().turnRed();
  } catch (e) {
    console.error(e.message); //output 'Error: Transition from green to red denied'
  }
})();
