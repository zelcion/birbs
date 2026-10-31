import { Context, CONTEXT_STATE_EVENT } from '../src/context';
import { describe, it } from 'mocha';
import { expect } from 'chai';

class GenericTestContext extends Context {
  constructor () {
    super({ identifier: 'identifier' });
  }
};

class TypedTestContext extends Context<{name : string; age : number}> {
  constructor () {
    super({ identifier: 'typed-identifier' });
  }
};

describe('Context State', () => {
  it('Sets information on the context', () => {
    const context = new GenericTestContext();

    context.setContextState({ cc: 'foo'});
    expect(context.contextState.cc).to.be.equal('foo');
  });

  it('Overwrites information on the context', () => {
    const context = new TypedTestContext();

    context.setContextState({ age: 44, name: 'foo' });
    expect(context.contextState.name).to.be.equal('foo');

    context.setContextState({ age: 45 });
    expect(context.contextState.name).to.be.equal('foo');
    expect(context.contextState.age).to.be.equal(45);
  });
});

describe('Context State Events', () => {
  it('emits exactly once per setContextState call with the updated state and changed keys', () => {
    const context = new GenericTestContext();
    let emissions = 0;
    let lastPayload;

    context.on(CONTEXT_STATE_EVENT, (payload) => {
      emissions++;
      lastPayload = payload;
    });

    context.setContextState({ a: 1 });
    context.setContextState({ b: 2 });

    expect(emissions).to.be.equal(2);
    expect(lastPayload.changed).to.be.deep.equal(['b']);
    expect(lastPayload.state).to.be.deep.equal({ a: 1, b: 2 });
    expect(lastPayload.context).to.be.equal(context);
  });

  it('lets a listener subscribed via on() observe the transition', () => {
    const context = new TypedTestContext();
    const seen = [];

    context.on(CONTEXT_STATE_EVENT, (payload) => {
      seen.push({ ...payload.state });
    });

    context.setContextState({ age: 30, name: 'ada' });

    expect(seen).to.have.lengthOf(1);
    expect(seen[0]).to.be.deep.equal({ age: 30, name: 'ada' });
  });

  it('removes a listener via off()', () => {
    const context = new GenericTestContext();
    let count = 0;

    const handler = () : void => { count++; };
    context.on(CONTEXT_STATE_EVENT, handler);

    context.setContextState({ a: 1 });
    context.off(CONTEXT_STATE_EVENT, handler);
    context.setContextState({ b: 2 });

    expect(count).to.be.equal(1);
  });
});
