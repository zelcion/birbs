import { describe, it } from 'mocha';
import { Context } from '../src/context';
import { EventManager } from '../src/manager';
import { expect } from 'chai';
import { Procedure } from '../src/procedure';

class NoopContext extends Context {
  public visibleProperty : string;

  constructor () {
    super({ identifier: 'identifier' });

    this.visibleProperty = 'unchanged';
  }
};

class MutatingProcedure extends Procedure {
  public async execute (context : NoopContext) : Promise<void> {
    context.visibleProperty = 'changed';
  };
};

describe('EventManager missing context', () => {
  it('addBirbable on an unregistered context is a no-op and does not throw', () => {
    const context = new NoopContext();
    const manager = new EventManager();

    manager.addContext(context);

    expect(() =>
      manager.addBirbable(new MutatingProcedure({ lifetime: 'DURABLE' }), 'never-registered')
    ).to.not.throw();

    manager.broadcast({ birbable: 'MutatingProcedure' });
    expect(context.visibleProperty).to.be.equal('unchanged');
  });

  it('removeBirbable on an unregistered context is a no-op and does not throw', () => {
    const context = new NoopContext();
    const manager = new EventManager();

    manager.addContext(context);

    expect(() =>
      manager.removeBirbable(new MutatingProcedure({ lifetime: 'DURABLE' }), 'never-registered')
    ).to.not.throw();
  });

  it('removeProcedure on an unregistered context is a no-op and does not throw', () => {
    const context = new NoopContext();
    const manager = new EventManager();

    manager.addContext(context);

    expect(() =>
      manager.removeProcedure(new MutatingProcedure({ lifetime: 'DURABLE' }), 'never-registered')
    ).to.not.throw();
  });

  it('addBirbable and removeProcedure still work on a registered context', () => {
    const context = new NoopContext();
    const manager = new EventManager();

    manager.addContext(context);

    manager.addBirbable(new MutatingProcedure({ lifetime: 'DURABLE' }), 'identifier');
    manager.broadcast({ birbable: 'MutatingProcedure' });
    expect(context.visibleProperty).to.be.equal('changed');

    manager.removeProcedure(new MutatingProcedure({ lifetime: 'DURABLE' }), 'identifier');
    manager.broadcast({ birbable: 'MutatingProcedure' }, 'second');
    expect(context.visibleProperty).to.be.equal('changed');
  });
});
