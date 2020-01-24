import { describe, it } from 'mocha';
import { BirbableGroup } from '../birbable-group';
import { Context } from '../context';
import { expect } from 'chai';
import { Identifier } from '../types';
import { Pipeline } from '../pipeline';
import { Procedure } from '../procedure';

describe('[ BIRBS API ]', () => {
  it('Context fires events successfully', () => {
    class TestContext extends Context {
      public text = 'AAAIOW';
    }

    class TestProcedure extends Procedure {
      private counter = 1;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public async execute (context : TestContext, _identifier : Identifier) : Promise<void> {
        context.text = context.text + this.counter;

        this.counter += 1;
      };
    }

    const procedureCreated = new TestProcedure({ identifier: 'aa', lifetime: 'DURABLE' });
    const contextCreated = new TestContext('context').sign(procedureCreated);

    contextCreated.trigger(procedureCreated.identifier);
    expect(contextCreated.text).to.be.equal('AAAIOW1');

    contextCreated.trigger(procedureCreated.identifier);
    expect(contextCreated.text).to.be.equal('AAAIOW12');
  });

  it('Pipelines executes in order', (done) => {
    class NumberContext extends Context {
      public currentCounter = 10;
    }

    class AddToCounter extends Procedure {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async execute(context : NumberContext, _identifier : Identifier) : Promise<void> {
        context.currentCounter += 8;
      }
    }

    class DivideCounter extends Procedure {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async execute(context : NumberContext, _identifier : Identifier) : Promise<void> {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 500);
          context.currentCounter = context.currentCounter / 2 ;
        });
      }
    }

    class MicroAddToCounter extends Procedure {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async execute(context : NumberContext, _identifier : Identifier) : Promise<void> {
        context.currentCounter += 0.000888;
      }
    }
    const addProcedure = new AddToCounter({ identifier: '1', lifetime: 'SINGLE' });
    const divideProcedure = new DivideCounter({ identifier: '2', lifetime: 'SINGLE' });
    const microAddProcedure = new MicroAddToCounter({ identifier: '3', lifetime: 'SINGLE' });

    const pipeline = new Pipeline({ identifier: 'aaaaa', lifetime: 'SINGLE' }, (context : NumberContext) => {
      expect(context.currentCounter).to.be.equal(9.000888);
      done();
    }).addStep(addProcedure)
      .addStep(divideProcedure)
      .addStep(microAddProcedure);

    const numberContext = new NumberContext('a123241').sign(pipeline);

    numberContext.trigger(addProcedure.identifier);
    expect(numberContext.currentCounter).to.be.equal(10);

    numberContext.trigger(divideProcedure.identifier);
    expect(numberContext.currentCounter).to.be.equal(10);

    numberContext.trigger(pipeline.identifier);
  });

  it('Birbables with SINGLE lifetime gets removed from the context', () => {
    class TestContext extends Context {
      public text = 'i am a test text texst';
    }

    class Helloizer extends Procedure {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async execute (context : TestContext, identifier : Identifier) : Promise<void> {
        context.text = `Hello! ${context.text}`;
      }
    }

    const helloizer = new Helloizer({ identifier: 'hello', lifetime: 'SINGLE'});
    const context = new TestContext('context').sign(helloizer);

    context.trigger(helloizer.identifier);
    expect(context.text).to.be.equal('Hello! i am a test text texst');

    context.trigger(helloizer.identifier);
    expect(context.text).to.be.equal('Hello! i am a test text texst');
  });

  it('Birbables with DURABLE lifetime gets removed from the context', () => {
    class TestContext extends Context {
      public text = 'i am a test text texst';
    }

    class Helloizer extends Procedure {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async execute (context : TestContext, identifier : Identifier) : Promise<void> {
        context.text = `Hello! ${context.text}`;
      }
    }

    const helloizer = new Helloizer({ identifier: 'hello', lifetime: 'DURABLE'});
    const context = new TestContext('context').sign(helloizer);

    context.trigger(helloizer.identifier);
    expect(context.text).to.be.equal('Hello! i am a test text texst');

    context.trigger(helloizer.identifier);
    expect(context.text).to.be.equal('Hello! Hello! i am a test text texst');
  });

  it('Birbable Group discards all and executes a single procedure', () => {
    class TestContext extends Context {
      public text = 'i am a test text texst';
    }

    class Helloizer extends Procedure {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async execute (context : TestContext, identifier : Identifier) : Promise<void> {
        context.text = `Hello! ${context.text}`;
      }
    }

    class Goodbyzer extends Procedure {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async execute (context : TestContext, identifier : Identifier) : Promise<void> {
        context.text = `Goodbye! ${context.text}`;
      }
    }

    class Mehizer extends Procedure {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async execute (context : TestContext, identifier : Identifier) : Promise<void> {
        context.text = `Meh! ${context.text}`;
      }
    }

    const helloizer = new Helloizer({ identifier: 'hello', lifetime: 'DURABLE'});
    const goodbyzer = new Goodbyzer({ identifier: 'goodbye', lifetime: 'DURABLE'});
    const mehizer = new Mehizer({ identifier: 'meh', lifetime: 'DURABLE'});
    const birbableGroup = new BirbableGroup('group')
      .addBirbable(goodbyzer).addBirbable(helloizer).addBirbable(mehizer);

    const context = new TestContext('context');
    context.sign(birbableGroup);

    context.trigger(helloizer.identifier);
    expect(context.text).to.be.equal('Hello! i am a test text texst');

    context.trigger(goodbyzer.identifier);
    context.trigger(helloizer.identifier);
    context.trigger(mehizer.identifier);
    expect(context.text).to.be.equal('Hello! i am a test text texst');
  });
});
