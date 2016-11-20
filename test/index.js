import test from 'ava';
import FiniteStateMachine from '../src';

test('Initial parameters', async(t) => {
  t.plan(8);
  class Foo extends FiniteStateMachine {
  }
  try {
    new Foo();
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /No initial state/);
  }

  try {
    new Foo('some state');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /No states defined/);
  }

  class Bar extends FiniteStateMachine {
    get states() {
      return { pending: {} };
    }
  }
  try {
    new Bar('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /No transitions defined/);
  }

  try {
    new Bar('somestate');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /Initial state \w+ not define/);
  }
});


test('Rule checking from & to', async(t) => {
  class Foo extends FiniteStateMachine {
    get states() {
      return { pending: {} };
    }

    get transitions() {
      return {
        approve: {}
      };
    }
  }

  try {
    new Foo('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /Transition require a from state and a to state/);
  }

  class FromMissing extends FiniteStateMachine {
    get states() {
      return { pending: {} };
    }

    get transitions() {
      return {
        approve: { from: 'some', to: 'pending' }
      };
    }
  }

  try {
    new FromMissing('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /contains undefined states/);
  }


  class FromArrayMissing extends FiniteStateMachine {
    get states() {
      return { pending: {} };
    }

    get transitions() {
      return {
        approve: { from: ['some', 'pending'], to: 'pending' }
      };
    }
  }

  try {
    new FromArrayMissing('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /contains undefined states/);
  }


  class ToMissing extends FiniteStateMachine {
    get states() {
      return { pending: {} };
    }

    get transitions() {
      return {
        approve: { from: 'pending', to: 'some' }
      };
    }
  }

  try {
    new ToMissing('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /contains undefined states/);
  }
});

test('Rule checking final state', async(t) => {
  class Final extends FiniteStateMachine {
    get states() {
      return { pending: { isFinal: true } };
    }

    get transitions() {
      return {
        approve: { from: 'pending', to: 'pending' }
      };
    }
  }

  try {
    new Final('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /defined a final state/);
  }

  class FinalInArray extends FiniteStateMachine {
    get states() {
      return { pending: { isFinal: true } };
    }

    get transitions() {
      return {
        approve: { from: ['pending'], to: 'pending' }
      };
    }
  }

  try {
    new FinalInArray('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /defined a final state/);
  }
});


test('Transition works', async(t) => {
  class OrderFsm extends FiniteStateMachine {
    get states() {
      return {
        pending: {},
        approved: {},
        canceled: {}
      };
    }

    get transitions() {
      return {
        approve: { from: 'pending', to: 'approved' },
        cancel: { from: ['approved'], to: 'canceled' },
      };
    }
  }

  const fsm = new OrderFsm('pending');
  t.false(fsm.checkState('some'));

  try {
    await fsm.transition('some');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /Target state \w+ not defined/);
  }

  try {
    await fsm.transition('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /denied/);
  }

  try {
    await fsm.transition('canceled');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /denied/);
  }

  t.is(fsm.getCurrentState(), 'pending');
  await fsm.transition('approved');
  t.is(fsm.getCurrentState(), 'approved');
  await fsm.transition('canceled');
  t.is(fsm.getCurrentState(), 'canceled');
  try {
    await fsm.transition('pending');
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /denied/);
  }
});


test('Callback works', async(t) => {
  t.plan(13);
  let exitPending = false;
  let enterApproved = false;
  let exitApproved = false;
  let count = 0;
  class OrderFsm extends FiniteStateMachine {
    get states() {
      return {
        pending: {
          onExit: (from, to, fsm) => {
            exitPending = true;
            t.is(from, 'pending');
            t.is(to, 'approved');
            t.true(exitPending);
          }
        },
        approved: {
          onEnter: async(from, to, fsm) => {
            enterApproved = true;
            t.is(from, 'pending');
            t.is(to, 'approved');
            t.true(enterApproved);
            t.false(exitApproved);
          },
          onExit: async(from, to, fsm) => {
            exitApproved = true;
            t.is(from, 'approved');
            t.is(to, 'canceled');
            t.true(exitApproved);
          }
        },
        canceled: {}
      };
    }

    get transitions() {
      return {
        approve: { from: 'pending', to: 'approved' },
        cancel: { from: ['pending', 'approved'], to: 'canceled' },
      };
    }

    onTransition() {
      count += 1;
    }
  }

  const fsm = new OrderFsm('pending');
  await fsm.do().approve();
  await fsm.do().cancel();
  t.is(count, 2);

  try {
    fsm.do().notExists();
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /Action \w+ not exists in transitions/);
  }
});

test('Able to throw error in proxy', async(t) => {
  class OrderFsm extends FiniteStateMachine {
    get states() {
      return {
        pending: {},
        approved: {}
      };
    }

    get transitions() {
      return {
        approve: { from: 'pending', to: 'approved' }
      };
    }
  }
  const fsm = new OrderFsm('approved');
  try {
    await fsm.do().approve();
  } catch (e) {
    t.true(e instanceof Error);
    t.regex(e.message, /denied/);
  }
});
