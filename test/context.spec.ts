import { Effect, FlushingStrategies } from '../src/utils/types';
import { Context } from '../src/context/context';
import { expect } from 'chai';
import { Procedure } from '../src/procedure/procedure';

describe('context methods', () => {
  const myProcedureIdentifier = Symbol('procedureID');
  const myProcedureType = 'ephemeral';
  let devProcedure : Procedure;
  beforeEach(() => {
    class LoggerEffect implements Effect {
      public execution (ev : Procedure) : void {
        console.log(`Procedure with identifier of ${String(ev.identifier)} has acted!`);
      }
    }

    devProcedure = new Procedure()
      .withIdentifier(myProcedureIdentifier)
      .withType(myProcedureType)
      .withEffect(new LoggerEffect())
      .build();
  });
  it.skip('Context Builder works' ,() => { // failing test
    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : FlushingStrategies = 'each-publish';

    const context = new Context()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withProcedures(devProcedure)
      .build();

    // expect(context.build).to.throw;
    context.withIdentifier(containerIdentifier);

    expect(context.identifier).to.be.equal(containerIdentifier);
  });

  it('Context publishing and flushing works', () => {
    class Effoz implements Effect {
      execution(this : PropTestContext) : void | Promise<void> {
        wasExecuted = true;
      }
    }

    const myEffect = new Effoz();

    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : FlushingStrategies = 'each-publish';
    let wasExecuted = false;
    const anotherProcedureId = Symbol('anotherId');
    const anotherProcedure = new Procedure()
      .withIdentifier(anotherProcedureId)
      .withType('permanent')
      .withEffect(myEffect)
      .build();

    class PropTestContext extends Context {
      blablau = 'Rudolf';
    }

    const context = new PropTestContext()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withProcedures([devProcedure, anotherProcedure])
      .build();

    expect(context.hasProcedure(myProcedureIdentifier)).to.be.true;

    context.publish(myProcedureIdentifier);
    expect(context.hasProcedure(myProcedureIdentifier)).to.be.false;
    expect(wasExecuted).to.be.false;
    expect(context.hasProcedure(anotherProcedureId)).to.be.true;

    context.publish(anotherProcedureId);
    expect(context.hasProcedure(myProcedureIdentifier)).to.be.false;

    expect(wasExecuted).to.be.true;
    expect(context.hasProcedure(anotherProcedureId)).to.be.true;
  });

  it('context adding and removing Procedures works', () => {
    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : FlushingStrategies = 'each-publish';
    const anotherProcedureId = Symbol('anotherId');

    const anotherProcedure = new Procedure()
      .withIdentifier(anotherProcedureId)
      .withType('permanent')
      .build();

    const context = new Context()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withProcedures([devProcedure])
      .build();

    expect(context.hasProcedure(myProcedureIdentifier)).to.be.true;
    expect(context.hasProcedure(anotherProcedureId)).to.be.false;

    context.resign(myProcedureIdentifier).sign(anotherProcedure);

    expect(context.hasProcedure(myProcedureIdentifier)).to.be.false;
    expect(context.hasProcedure(anotherProcedureId)).to.be.true;

  });
});
