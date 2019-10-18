import { Behaviour } from '../src/behaviour/behaviour';
import { Container } from '../src/container/container';
import { expect } from 'chai';
import { TeardownStrategies } from '../src/utils/types';

describe.only('container methods', () => {
  const myBehaviourIdentifier = Symbol('behaviourID');
  const myBehaviourType = 'once';
  let devBehaviour : Behaviour;
  beforeEach(() => {
    const logFunction = (ev : Behaviour) : void=> {
      console.log(`Behaviour with identifier of ${String(ev.identifier)} has acted!`);
    };

    devBehaviour = new Behaviour()
      .withIdentifier(myBehaviourIdentifier)
      .withType(myBehaviourType)
      .withAction(logFunction)
      .build();
  });
  it('Container Builder works' ,() => {
    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : TeardownStrategies = 'once';

    const container = new Container()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withBehaviours(devBehaviour)
      .build();

    expect(container.identifier).to.be.equal(containerIdentifier);
  });

  it('Container publishing and flushing works', () => {
    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : TeardownStrategies = 'once';
    let wasExecuted = false;
    const anotherBehaviourId = Symbol('anotherId');
    const anotherBehaviour = new Behaviour()
      .withIdentifier(anotherBehaviourId)
      .withType('always')
      .withAction(() => {wasExecuted = true;})
      .build();

    const container = new Container()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withBehaviours([devBehaviour, anotherBehaviour])
      .build();

    expect(container.hasBehaviour(myBehaviourIdentifier)).to.be.true;

    container.publish(myBehaviourIdentifier);
    expect(container.hasBehaviour(myBehaviourIdentifier)).to.be.false;
    expect(wasExecuted).to.be.false;
    expect(container.hasBehaviour(anotherBehaviourId)).to.be.true;

    container.publish(anotherBehaviourId);
    expect(container.hasBehaviour(myBehaviourIdentifier)).to.be.false;
    expect(wasExecuted).to.be.true;
    expect(container.hasBehaviour(anotherBehaviourId)).to.be.true;
  });

  it('container adding and removing Behaviours works', () => {
    const containerIdentifier = Symbol('MyContainerId');
    const conainerStrategy : TeardownStrategies = 'once';
    const anotherBehaviourId = Symbol('anotherId');

    const anotherBehaviour = new Behaviour()
      .withIdentifier(anotherBehaviourId)
      .withType('always')
      .withAction(() => {console.log(true);})
      .build();

    const container = new Container()
      .withStrategy(conainerStrategy)
      .withIdentifier(containerIdentifier)
      .withBehaviours([devBehaviour])
      .build();

    expect(container.hasBehaviour(myBehaviourIdentifier)).to.be.true;
    expect(container.hasBehaviour(anotherBehaviourId)).to.be.false;

    container.resign(myBehaviourIdentifier).sign(anotherBehaviour);

    expect(container.hasBehaviour(myBehaviourIdentifier)).to.be.false;
    expect(container.hasBehaviour(anotherBehaviourId)).to.be.true;

  });
});
