import 'reflect-metadata';
import EventEmitter from 'events';

export abstract class DomainEvent {
  public readonly identifier : string;
}

class CustomEmitter extends EventEmitter {
};

export class EventPair {
  public event : DomainEvent;
  public execute : EventAction;

  public constructor (event : DomainEvent, execute : EventAction) {
    this.event = event;
    this.execute = execute;
  }
}

export class EventGroup {
  public name : string;
  public emitter : CustomEmitter = new CustomEmitter;
  public signedEvents : DomainEvent[] = [];

  public constructor (name : string) {
    this.name = name;
  }

  public publish(event : DomainEvent) : void {
    this.emitter.emit(event.identifier, event);

    this.teardown();
  }

  private teardown() : void {
    this.signedEvents.forEach((event) => {
      this.emitter.removeAllListeners(event.identifier);
    });

    this.signedEvents = [];
  }

  public once(eventPairs : EventPair[]) : void {
    eventPairs.forEach((pair) => {
      this.emitter.once(pair.event.identifier, pair.execute);
      this.signedEvents.push(pair.event);
    });
  }
}

export type EventAction = (event : DomainEvent) => void;

export class EventPublisher {
  private eventGroups : EventGroup[] = [];

  public broadcast(event : DomainEvent, eventGroupName : string) : void {
    console.log(this.eventGroups);
    const eventGroup = this.pickGroup(eventGroupName);

    if (eventGroup === undefined) return;

    eventGroup.publish(event);
  }

  public listen(eventGroupName : string, eventPairs : EventPair[] ) : void {
    const eventGroup = this.pickGroup(eventGroupName);

    if (eventGroup === undefined) throw 'NO EVENT GROUP REGISTERED WITH THAT NAME';

    eventGroup.once(eventPairs);
  }

  public submitGroup(eventGroup : EventGroup) : void {
    this.eventGroups.push(eventGroup);
  }

  public unsubmitGroup(eventGroup : EventGroup) : void {
    const index = this.eventGroups.findIndex((group) => group.name === eventGroup.name);
    if (index === -1) return;

    this.eventGroups.splice(index);
  }

  private pickGroup(name : string) : EventGroup | undefined {
    return this.eventGroups.find((group) => group.name === name);
  }

};

