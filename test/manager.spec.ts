import { Context } from '../src/context/context';
import { EventManager } from '../src/manager/manager';
import { expect } from 'chai';
import { Procedure } from '../src/procedure/procedure';
import { TeardownStrategies } from '../src/utils/types';

describe('Manager methods', () => {
  const myProcedureIdentifier = Symbol('behaviourID');
  const myProcedureType = 'once';
  const containerIdentifier = Symbol('MyContainerId');
  const conainerStrategy : TeardownStrategies = 'once';

  let defaultContainer : Context;
  let devProcedure : Procedure;
  beforeEach(() => {
    const logFunction = (ev : Procedure) : void => {
      console.log(`Procedure with identifier of ${String(ev.identifier)} has acted!`);
    };

    devProcedure = new Procedure()
      .withIdentifier(myProcedureIdentifier)
      .withType(myProcedureType)
      .withAction(logFunction)
      .build();

    defaultContainer = new Context()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withProcedures(devProcedure)
      .build();
  });
  it('Manager creating and adding works', () => {
    const defaultManager = new EventManager();

    defaultManager.addContainer(defaultContainer);

    expect(defaultManager.fetchContainer(containerIdentifier)).to.be.deep.equal(defaultContainer);
  });
  it('Manager broadcasting and removing works', () => {
    const defaultManager = new EventManager();

    let wasExecuted = false;
    const anotherProcedureId = Symbol('anotherId');
    const anotherProcedure = new Procedure()
      .withIdentifier(anotherProcedureId)
      .withType('always')
      .withAction(() => {wasExecuted = true;})
      .build();

    defaultManager.addContainer(defaultContainer);
    defaultManager.listen(anotherProcedure, containerIdentifier);

    expect(defaultContainer.getProcedure(myProcedureIdentifier)).to.be.deep.equal(devProcedure);

    defaultManager.broadcast(anotherProcedureId);

    expect(defaultContainer.getProcedure(myProcedureIdentifier)).to.be.undefined;
    expect(defaultManager.fetchContainer(containerIdentifier)).to.be.deep.equal(defaultContainer);

    defaultManager.removeContainer(containerIdentifier);

    expect(defaultManager.fetchContainer(containerIdentifier)).to.be.undefined;
    expect(wasExecuted).to.be.true;
  });
});
