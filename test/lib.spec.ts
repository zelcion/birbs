import { describe, it } from 'mocha';
import { BroadcastsRecorder } from '../src/broadcasts-recorder';
import { BroadcastsRecorderEvents } from '../src/types';
import { Context } from '../src/context';
import { EventManager } from '../src/manager';
import { expect } from 'chai';
import { Pipeline } from '../src/pipeline';
import { Procedure } from '../src/procedure';

describe('[ BIRBS API ]', () => {
  it('Context fires events successfully', () => {
    let callbackExecuted = false;
    class TestContext extends Context {
      public text = 'text ';
    }

    class TestProcedure extends Procedure {
      public counter = 1;

      public async execute (context : TestContext, descriptable ?: number ) : Promise<void> {
        context.text = context.text + this.counter;

        this.counter += descriptable || 1;
      };
    }

    const procedureCreated = new TestProcedure({lifetime: 'DURABLE' });

    const contextId = Symbol('Context');
    const contextCreated = new TestContext({ identifier: contextId });
    const broadcastController = new BroadcastsRecorder();
    const manager = new EventManager(broadcastController);

    manager.addContext(contextCreated).addBirbable(procedureCreated, contextId);

    broadcastController.on(BroadcastsRecorderEvents.DUMP, () => {
      callbackExecuted = true;
      expect(procedureCreated.counter).to.be.above(1);
    });

    manager.broadcast({ birbable: 'TestProcedure', context: contextId}, 8);
    expect(contextCreated.text).to.be.equal('text 1');

    manager.broadcast({ birbable: 'TestProcedure' });
    expect(contextCreated.text).to.be.equal('text 19');

    expect(manager.broadcasts.dump().length).to.be.equal(2);
    expect(manager.broadcasts.dump().length).to.be.equal(0);
    expect(callbackExecuted).to.be.true;
  });

  it('Pipelines executes in order', (done) => {
    class NumberContext extends Context {
      public currentCounter = 10;
    }

    class AddToCounter extends Procedure {
      async execute(context : NumberContext) : Promise<void> {
        context.currentCounter += 8;
      }
    }

    class TimedDivideCounter extends Procedure {
      async execute(context : NumberContext) : Promise<void> {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 100);
          context.currentCounter = context.currentCounter / 2 ;
        });
      }
    }

    class MicroAddToCounter extends Procedure {
      async execute(context : NumberContext) : Promise<void> {
        context.currentCounter += 0.000888;
      }
    }
    const addProcedure = new AddToCounter({ lifetime: 'SINGLE' });
    const divideProcedure = new TimedDivideCounter({ lifetime: 'SINGLE' });
    const microAddProcedure = new MicroAddToCounter({ lifetime: 'SINGLE' });

    class MutationPipeline extends Pipeline {};

    const pipeline = new MutationPipeline({ lifetime: 'SINGLE' }, (context : NumberContext) => {
      expect(context.currentCounter).to.be.equal(9.000888);
    }).addStep(addProcedure)
      .addStep(divideProcedure)
      .addStep(microAddProcedure);

    const numberContext = new NumberContext({ identifier: 'aa' }).sign(pipeline);

    setTimeout(() => {
      numberContext.trigger({ birbable: 'AddToCounter' });
      expect(numberContext.currentCounter).to.be.equal(10);

      numberContext.trigger({ birbable: 'TimedDivideCounter' });
      expect(numberContext.currentCounter).to.be.equal(10);

      numberContext.trigger({ birbable: 'MicroAddToCounter' });
      expect(numberContext.currentCounter).to.be.equal(10);
      done();
    }, 500);
  });

  it('Birbables with SINGLE lifetime gets removed from the context', () => {
    class TestContext extends Context {
      public text = 'i am a test text texst';
    }

    class Helloizer extends Procedure {
      async execute (context : TestContext) : Promise<void> {
        context.text = `Hello! ${context.text}`;
      }
    }

    const helloizer = new Helloizer({ lifetime: 'SINGLE'});
    const context = new TestContext({ identifier: 'aa' }).sign(helloizer);

    context.trigger({ birbable: 'Helloizer' });
    expect(context.text).to.be.equal('Hello! i am a test text texst');

    context.trigger({ birbable: 'Helloizer' });
    expect(context.text).to.be.equal('Hello! i am a test text texst');
  });

  it('Birbables with DURABLE lifetime does not get removed from the context', () => {
    class TestContext extends Context {
      public text = 'i am a test text texst';
    }

    class Helloizer extends Procedure {
      async execute (context : TestContext) : Promise<void> {
        context.text = `Hello! ${context.text}`;
      }
    }

    const helloizer = new Helloizer({ lifetime: 'DURABLE'});
    const context = new TestContext({ identifier: 'aa' }).sign(helloizer);

    context.trigger({ birbable: 'Helloizer' });
    expect(context.text).to.be.equal('Hello! i am a test text texst');

    context.trigger({ birbable: 'Helloizer' });
    expect(context.text).to.be.equal('Hello! Hello! i am a test text texst');
  });

  it('Birbable Group discards all and executes a single procedure', () => {
    class TestContext extends Context {
      public text = 'i am a test text texst';
    }

    class Helloizer extends Procedure {
      async execute (context : TestContext) : Promise<void> {
        context.text = `Hello! ${context.text}`;
      }
    }

    class Goodbyzer extends Procedure {
      async execute (context : TestContext) : Promise<void> {
        context.text = `Goodbye! ${context.text}`;
      }
    }

    class Mehizer extends Procedure {
      async execute (context : TestContext) : Promise<void> {
        context.text = `Meh! ${context.text}`;
      }
    }

    const groupToken = Symbol('Group');

    const helloizer = new Helloizer({ group: groupToken, lifetime: 'DURABLE' });
    const goodbyzer = new Goodbyzer({ group: groupToken, lifetime: 'DURABLE'});
    const mehizer = new Mehizer({ group: groupToken, lifetime: 'DURABLE'});

    const context = new TestContext({ identifier: 'aa' } );
    context.sign(helloizer).sign(goodbyzer).sign(mehizer);

    // context[helloizer.identifier];
    context.trigger({ birbable: 'Helloizer' });
    expect(context.text).to.be.equal('Hello! i am a test text texst');

    context.trigger({ birbable: 'Goodbyzer' });
    context.trigger({ birbable: 'Helloizer' });
    context.trigger({ birbable: 'Mehizer' });
    expect(context.text).to.be.equal('Hello! i am a test text texst');
  });
});
