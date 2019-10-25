import { Context } from '../src/context/context';
import { expect } from 'chai';
import { Procedure } from '../src/procedure/procedure';
import { TeardownStrategies } from '../src/utils/types';

describe('container methods', () => {
  const myProcedureIdentifier = Symbol('behaviourID');
  const myProcedureType = 'once';
  let devProcedure : Procedure;
  beforeEach(() => {
    const logFunction = (ev : Procedure) : void=> {
      console.log(`Procedure with identifier of ${String(ev.identifier)} has acted!`);
    };

    devProcedure = new Procedure()
      .withIdentifier(myProcedureIdentifier)
      .withType(myProcedureType)
      .withAction(logFunction)
      .build();
  });
  it('Context Builder works' ,() => {
    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : TeardownStrategies = 'once';

    const container = new Context()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withProcedures(devProcedure)
      .build();

    expect(container.identifier).to.be.equal(containerIdentifier);
  });

  it('Context publishing and flushing works', () => {
    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : TeardownStrategies = 'once';
    let wasExecuted = false;
    const anotherProcedureId = Symbol('anotherId');
    const anotherProcedure = new Procedure()
      .withIdentifier(anotherProcedureId)
      .withType('always')
      .withAction((ev : Procedure, context : Context) => {
        wasExecuted = true;
        console.log(context, ev);
      })
      .build();

    const container = new Context()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withProcedures([devProcedure, anotherProcedure])
      .build();

    expect(container.hasProcedure(myProcedureIdentifier)).to.be.true;

    container.publish(myProcedureIdentifier);
    expect(container.hasProcedure(myProcedureIdentifier)).to.be.false;
    expect(wasExecuted).to.be.false;
    expect(container.hasProcedure(anotherProcedureId)).to.be.true;

    container.publish(anotherProcedureId);
    expect(container.hasProcedure(myProcedureIdentifier)).to.be.false;
    expect(wasExecuted).to.be.true;
    expect(container.hasProcedure(anotherProcedureId)).to.be.true;
  });

  it('container adding and removing Procedures works', () => {
    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : TeardownStrategies = 'once';
    const anotherProcedureId = Symbol('anotherId');

    const anotherProcedure = new Procedure()
      .withIdentifier(anotherProcedureId)
      .withType('always')
      .withAction(() => {console.log(true);})
      .build();

    const container = new Context()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withProcedures([devProcedure])
      .build();

    expect(container.hasProcedure(myProcedureIdentifier)).to.be.true;
    expect(container.hasProcedure(anotherProcedureId)).to.be.false;

    container.resign(myProcedureIdentifier).sign(anotherProcedure);

    expect(container.hasProcedure(myProcedureIdentifier)).to.be.false;
    expect(container.hasProcedure(anotherProcedureId)).to.be.true;

  });
});
