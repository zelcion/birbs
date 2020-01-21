import { Context } from '../src/context/context';
import { Effect } from '../src/utils/types';
import { EventManager } from '../src/manager/manager';
import { expect } from 'chai';
import { Pipeline } from '../src/procedure/pipeline';
import { Procedure } from '../src/procedure/procedure';
import { toNewEffect } from '../src/utils/utils';

describe('Birbs API', () => {
  class TestProcedure extends Procedure {
    public testVariable = 'foo';
  };

  class TestContext extends Context {
    public testConstant = 'bar';
  }

  class TestEffect implements Effect {
    public execution(ev : TestProcedure) : void {
      console.log(ev);
    }
  }
  describe('Builders', () => {
    it('Procedures', () => {
      const TestProcedureId = Symbol('test');
      const TestProcedureInstance = new TestProcedure()
        .withIdentifier(TestProcedureId)
        .withLifecycle('ephemeral');

      const builder = () : void => {
        TestProcedureInstance.build();
      };

      expect(builder).to.throw();

      TestProcedureInstance.withEffect(new TestEffect());

      expect(builder).to.not.throw();
      expect(TestProcedureInstance.effects.length).to.be.equal(1);
    });

    it('Contexts', () => {
      const procedureId = Symbol('Procedure');
      const TestProcedureInstance = new TestProcedure()
        .withIdentifier(procedureId)
        .withLifecycle('permanent')
        .withEffect(new TestEffect()).build();

      const contextId = Symbol('Context');

      const ContextInstance = new TestContext();

      const builder = () : void => {
        ContextInstance.build();
      };

      expect(builder).to.throw();

      ContextInstance.withIdentifier(contextId);

      expect(builder).to.throw();

      ContextInstance.withProcedures(TestProcedureInstance);

      expect(builder).to.throw();

      ContextInstance.withStrategy('no-flush');

      expect(builder).to.not.throw();
    });

    it('Effect Maker and lazy builder', async (done) => {
      function anAssertion (this : TestContext) : void {
        expect(this.testConstant).to.be.equal('bar');
        done();
      };

      const procedure = new TestProcedure()
        .build({
          effects: [toNewEffect(anAssertion)],
          identifier: 'name',
          lifecycle: 'permanent'
        });

      const context = new TestContext()
        .build({
          identifier: 'context',
          strategy: 'no-flush'
        });

      context.sign(procedure);

      context.trigger(procedure);
    });
  });

  describe('Modules Interaction', () => {
    it('Effect-Procedure-Context interaction', () => {
      class MutateVariableValue extends Procedure {
        public aSample : string;

        public constructor (value : string) {
          super();
          this.aSample = value;
        }
      }

      class ModifyToRandomNumber implements Effect {
        public execution (this : TestContext, ev : MutateVariableValue) : void {
          this.testConstant = ev.aSample;
        }
      }

      const aTestContext = new TestContext().build({
        identifier: 'contextIdentifier',
        strategy: 'each-publish'
      });

      const aProcedure = new MutateVariableValue(
        (Math.random() * 10).toString()
      ).build({
        effects: [new ModifyToRandomNumber()],
        identifier: 'procedureIdentifier',
        lifecycle: 'ephemeral'
      });

      aTestContext.sign(aProcedure);
      expect(aTestContext.hasProcedure(aProcedure)).to.be.true;

      aTestContext.trigger(aProcedure.identifier);
      expect(aTestContext.testConstant).to.be.eq(aProcedure.aSample);
      expect(aTestContext.hasProcedure(aProcedure)).to.be.false;
    });

    it('Context-Procedure Lifecycle control', () => {
      function anEffect (this : TestContext) : void {
        // Empty sample effect
      };

      const aTestContext = new TestContext().build({
        identifier: 'contextIdentifier',
        strategy: 'each-publish'
      });

      const ephemeralProcedure = new TestProcedure().build({
        effects: [toNewEffect(anEffect)],
        identifier: 'ephmeralProcedure',
        lifecycle: 'ephemeral'
      });

      const permanentProcedure = new TestProcedure().build({
        effects: [toNewEffect(anEffect)],
        identifier: 'permanentProcedure',
        lifecycle: 'permanent'
      });

      aTestContext.sign([ephemeralProcedure, permanentProcedure]);
      expect(aTestContext.hasProcedure(permanentProcedure)).to.be.equal(true);
      expect(aTestContext.hasProcedure(ephemeralProcedure)).to.be.equal(true);

      aTestContext.trigger(permanentProcedure);

      expect(aTestContext.hasProcedure(permanentProcedure)).to.be.equal(true);
      expect(aTestContext.hasProcedure(ephemeralProcedure)).to.be.equal(false);

      aTestContext.trigger(permanentProcedure);

      expect(aTestContext.hasProcedure(permanentProcedure)).to.be.equal(true);
      expect(aTestContext.hasProcedure(ephemeralProcedure)).to.be.equal(false);
    });

    it('EventManager-context interaction', () => {
      function anEffect (this : TestContext) : void {
        // Empty sample effect
      };

      const manager = new EventManager();

      const aTestContext = new TestContext().build({
        identifier: 'contextIdentifier',
        strategy: 'each-publish'
      });

      const anotherTestContext = new TestContext().build({
        identifier: 'anotherContextIdentifier',
        strategy: 'each-publish'
      });

      const ephemeralProcedure = new TestProcedure().build({
        effects: [toNewEffect(anEffect)],
        identifier: 'ephmeralProcedure',
        lifecycle: 'ephemeral'
      });

      const permanentProcedure = new TestProcedure().build({
        effects: [toNewEffect(anEffect)],
        identifier: 'permanentProcedure',
        lifecycle: 'permanent'
      });

      manager.addContext(anotherTestContext);
      manager.addContext(aTestContext);

      expect(manager.fetchContext(anotherTestContext.identifier))
        .to.be.equal(anotherTestContext);

      manager.addProcedure(ephemeralProcedure, aTestContext);
      manager.addProcedure(ephemeralProcedure, anotherTestContext);
      manager.addProcedure(permanentProcedure, aTestContext);
      manager.addProcedure(permanentProcedure, anotherTestContext);

      expect(aTestContext.hasProcedure(permanentProcedure)).to.be.equal(true);
      expect(aTestContext.hasProcedure(ephemeralProcedure)).to.be.equal(true);

      manager.broadcast(ephemeralProcedure);

      expect(aTestContext.hasProcedure(permanentProcedure)).to.be.equal(true);
      expect(aTestContext.hasProcedure(ephemeralProcedure)).to.be.equal(false);
      expect(anotherTestContext.hasProcedure(permanentProcedure)).to.be.equal(true);
      expect(anotherTestContext.hasProcedure(ephemeralProcedure)).to.be.equal(false);
    });
  });

  it('[ASYNC] Pipelines tests', (done) => {
    class NumberContext extends Context {
      public currentCounter = 10;
    }

    class AddToCounter implements Effect<Procedure> {
      execution(this : NumberContext) : void {
        this.currentCounter += 8;
      }
    }

    class DivideCounter implements Effect<Procedure> {
      async execution(this : NumberContext) : Promise<void> {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
          this.currentCounter = this.currentCounter / 2 ;
        });
      }
    }

    class MicroAddToCounter implements Effect<Procedure> {
      execution(this : NumberContext) : void {
        this.currentCounter += 0.000888;
      }
    }

    const pipe = new Pipeline(() => {
      expect(contextInstance.currentCounter).to.be.equal(9.000888);
      done();
    })
      .step(new AddToCounter())
      .step(new DivideCounter())
      .step(new MicroAddToCounter());

    const procInstance = new TestProcedure().withIdentifier('Yaa')
      .withLifecycle('permanent')
      .withPipeline(pipe)
      .build();

    const contextInstance = new NumberContext().withIdentifier('oo').withProcedures(procInstance)
      .withStrategy('no-flush').build();

    contextInstance.trigger(procInstance.identifier);
  });
});
