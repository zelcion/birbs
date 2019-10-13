import { DomainEvent, EventGroup, EventPair, EventPublisher } from '../src/index';
import { expect } from 'chai';

describe('Event is dispared and captured', () => {
  let eventHandler : EventPublisher;

  beforeEach(() => {
    eventHandler = new EventPublisher();
  });
  it('event test', () => {
    const eventGroup : EventGroup = new EventGroup('GroupName');
    eventHandler.submitGroup(eventGroup);

    const myGroupOnPublisher = eventHandler.groupsNames.find((group) => group === eventGroup.name);
    expect(myGroupOnPublisher).to.be.equal(eventGroup.name);

    const expectateMutation = () : void => {
      expect(variableToBeModifiedByEvent).to.be.equal(46);
    };

    let variableToBeModifiedByEvent = 5;
    const addToVariable = (addition : MyEvent) : void => {
      variableToBeModifiedByEvent = variableToBeModifiedByEvent + addition.myAddition;
      expectateMutation();
      return;
    };

    class MyEvent extends DomainEvent {
      public identifier = 'myBirbHasFlapped';
      public myAddition = 41;
    }

    const eventInstance = new MyEvent;

    const eventPair : EventPair = new EventPair(eventInstance, addToVariable);
    eventHandler.listen(eventGroup.name, [eventPair]);

    expect(variableToBeModifiedByEvent).to.be.equal(5);
    eventHandler.broadcast(eventInstance, eventGroup.name);
  });
});
