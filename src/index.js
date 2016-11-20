export default class FiniteStateMachine {
  get states() {
    return {};
  }

  get transitions() {
    return {};
  }

  async onTransition(from, to) {
    return Promise.resolve({
      from,
      to
    });
  }

  constructor(initialState) {
    //TODO: Caching self checking result
    this.initialState = initialState;
    if (!this.initialState) {
      throw new Error('No initial state');
    }
    this.currentState = initialState;

    const states = Object.keys(this.states);
    if (states.length < 1) {
      throw new Error('No states defined');
    }
    if (states.includes(initialState) === false) {
      throw new Error(`Initial state ${initialState} not defined`);
    }

    const rules = Object.entries(this.transitions);
    if (rules.length < 1) {
      throw new Error('No transitions defined');
    }

    for (const [rule, { from, to }] of rules) {
      if (!from || !to) {
        throw new Error('Transition require a from state and a to state');
      }

      if (
        states.includes(to) === false ||
        (typeof from === 'string' && states.includes(from) === false) ||
        (Array.isArray(from) && from.filter(s => states.includes(s)).length !== from.length)
      ) {
        throw new Error(`Transition ${rule} contains undefined states`);
      }

      const fromStates = typeof from === 'string' ? [from] : from;
      for (const fromState of fromStates) {
        if (this.states[fromState].isFinal === true) {
          throw new Error(`Transition ${rule} defined a final state ${fromState} in from state`);
        }
      }
    }

    this.actions = null;
  }

  getCurrentState() {
    return this.currentState;
  }

  checkState(state) {
    return Object.keys(this.states).includes(state);
  }

  do() {
    if (this.actions) {
      return this.actions;
    }

    this.actions = new Proxy(this.transitions, {
      get: (target, action) => {
        if ({}.hasOwnProperty.call(target, action)) {
          return async () =>
            await this.transition(target[action].to);
        }
        throw new Error(`Action ${action} not exists in transitions`);
      }

    });
    return this.actions;
  }

  async transition(toState) {
    if (this.checkState(toState) === false) {
      throw new Error(`Target state ${toState} not defined`);
    }

    const transitions = Object.values(this.transitions);
    const fromState = this.currentState;
    for (const { from, to } of transitions) {
      if (
        to === toState &&
        (from === fromState || (Array.isArray(from) && from.includes(fromState)))
      ) {
        this.currentState = toState;
        break;
      }
    }

    if (fromState === this.currentState) {
      throw new Error(`Transition from ${fromState} to ${toState} denied`);
    }

    const { onExit } = this.states[fromState];
    const { onEnter } = this.states[toState];
    if (onExit) {
      await onExit(fromState, toState, this);
    }
    if (onEnter) {
      await onEnter(fromState, toState, this);
    }
    await this.onTransition(fromState, toState, this);

    return {
      from: fromState,
      to: toState
    };
  }
}
