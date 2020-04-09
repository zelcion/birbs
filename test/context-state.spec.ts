import { describe, it } from 'mocha';
import { Context } from '../src/context';
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
