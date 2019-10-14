import { Behaviour } from '../src/behaviour';
import { Container } from '../src/container';
import { expect } from 'chai';

describe.only('container methods', () => { // I know the tests are really bad
  it('creation, naming, execution, tearing down', () => {
    const myContainer = new Container('contName', 'once');
    class MyAlwaysTestBehaviour extends Behaviour {
      identifier = Symbol('test');
      type : 'always' = 'always';
      public customVariable = 42;
    }

    class MyOnceTestBehaviour extends Behaviour {
      identifier = Symbol('test2');
      type : 'once' = 'once';
      public nameVariable = 'George';
    }

    let testVariable = 'William';
    const myOnceBehaviourInstance = new MyOnceTestBehaviour();
    const testfunction2 = (ev : MyOnceTestBehaviour) : void => {
      testVariable = ev.nameVariable;
    };
    myOnceBehaviourInstance.bindAction(testfunction2, 'suffer');

    const myAlwaysBehaviourInstance = new MyAlwaysTestBehaviour();
    const testFunction = (ev : MyAlwaysTestBehaviour) : void => {
      ev.customVariable += 45;
    };
    myAlwaysBehaviourInstance.bindAction(testFunction, 'testFunc');

    myContainer.sign([myAlwaysBehaviourInstance, myOnceBehaviourInstance]);

    expect(myContainer.behaviours).to.contain(myAlwaysBehaviourInstance);
    expect(myContainer.behaviours).to.contain(myOnceBehaviourInstance);

    myContainer.publish(myAlwaysBehaviourInstance);

    expect(myAlwaysBehaviourInstance.customVariable).to.be.equal(45 + 42);
    expect(testVariable).to.not.be.equal(myOnceBehaviourInstance.nameVariable);
    expect(myContainer.behaviours).to.not.be.empty;
    expect(myContainer.behaviours).to.contain(myAlwaysBehaviourInstance);
    expect(myContainer.behaviours).to.not.contain(myOnceBehaviourInstance);

    myContainer.resign(myAlwaysBehaviourInstance);
    expect(myContainer.behaviours).to.be.empty;

  });
});
