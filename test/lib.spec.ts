import { describe, it } from 'mocha';
import { Context } from '../src/context';
import { expect } from 'chai';
import { Pipeline } from '../src/pipeline';
import { Procedure } from '../src/procedure';

describe('[ BIRBS API ]', () => {
  it('Context fires events successfully', () => {
    class TestContext extends Context {
      public text = 'text ';
    }

    class TestProcedure extends Procedure {
      private counter = 1;

      public async execute (context : TestContext) : Promise<void> {
        context.text = context.text + this.counter;

        this.counter += 1;
      };
    }

    const procedureCreated = new TestProcedure({ identifier: 'aa', lifetime: 'DURABLE' });
    const contextCreated = new TestContext('context').sign(procedureCreated);
    const secondContext = new TestContext('context2');
    secondContext.text = 'hello ';
    secondContext.sign(procedureCreated);

    contextCreated.trigger(procedureCreated.identifier);
    expect(contextCreated.text).to.be.equal('text 1');

    contextCreated.trigger(procedureCreated.identifier);
    expect(contextCreated.text).to.be.equal('text 12');

    secondContext.trigger(procedureCreated.identifier);
    expect(secondContext.text).to.be.equal('hello 3');

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

    class DivideCounter extends Procedure {
      async execute(context : NumberContext) : Promise<void> {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 500);
          context.currentCounter = context.currentCounter / 2 ;
        });
      }
    }

    class MicroAddToCounter extends Procedure {
      async execute(context : NumberContext) : Promise<void> {
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
      async execute (context : TestContext) : Promise<void> {
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

  it('Birbables with DURABLE lifetime does not get removed from the context', () => {
    class TestContext extends Context {
      public text = 'i am a test text texst';
    }

    class Helloizer extends Procedure {
      async execute (context : TestContext) : Promise<void> {
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

    const helloizer = new Helloizer({ group: groupToken, identifier: 'hello', lifetime: 'DURABLE' });
    const goodbyzer = new Goodbyzer({ group: groupToken, identifier: 'goodbye', lifetime: 'DURABLE'});
    const mehizer = new Mehizer({ group: groupToken, identifier: 'meh', lifetime: 'DURABLE'});

    const context = new TestContext('context');
    context.sign(helloizer).sign(goodbyzer).sign(mehizer);

    context[helloizer.identifier];
    context.trigger(helloizer.identifier);
    expect(context.text).to.be.equal('Hello! i am a test text texst');

    context.trigger(goodbyzer.identifier);
    context.trigger(helloizer.identifier);
    context.trigger(mehizer.identifier);
    expect(context.text).to.be.equal('Hello! i am a test text texst');
  });
});
