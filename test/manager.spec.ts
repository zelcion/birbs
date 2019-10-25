import { Behaviour } from '../src/behaviour/behaviour';
import { Context } from '../src/context/context';
import { EventManager } from '../src/manager/manager';
import { expect } from 'chai';
import { TeardownStrategies } from '../src/utils/types';

describe('Manager methods', () => {
  const myBehaviourIdentifier = Symbol('behaviourID');
  const myBehaviourType = 'once';
  const containerIdentifier = Symbol('MyContainerId');
  const conainerStrategy : TeardownStrategies = 'once';

  let defaultContainer : Context;
  let devBehaviour : Behaviour;
  beforeEach(() => {
    const logFunction = (ev : Behaviour) : void => {
      console.log(`Behaviour with identifier of ${String(ev.identifier)} has acted!`);
    };

    devBehaviour = new Behaviour()
      .withIdentifier(myBehaviourIdentifier)
      .withType(myBehaviourType)
      .withAction(logFunction)
      .build();

    defaultContainer = new Context()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withBehaviours(devBehaviour)
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
    const anotherBehaviourId = Symbol('anotherId');
    const anotherBehaviour = new Behaviour()
      .withIdentifier(anotherBehaviourId)
      .withType('always')
      .withAction(() => {wasExecuted = true;})
      .build();

    defaultManager.addContainer(defaultContainer);
    defaultManager.listen(anotherBehaviour, containerIdentifier);

    expect(defaultContainer.getBehaviour(myBehaviourIdentifier)).to.be.deep.equal(devBehaviour);

    defaultManager.broadcast(anotherBehaviourId);

    expect(defaultContainer.getBehaviour(myBehaviourIdentifier)).to.be.undefined;
    expect(defaultManager.fetchContainer(containerIdentifier)).to.be.deep.equal(defaultContainer);

    defaultManager.removeContainer(containerIdentifier);

    expect(defaultManager.fetchContainer(containerIdentifier)).to.be.undefined;
    expect(wasExecuted).to.be.true;
  });
});
