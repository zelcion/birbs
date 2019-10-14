import { getStringFromSymbol, setSymbol } from './utils';
import { Behaviour } from './behaviour';
import EventEmitter from 'events';
import { TeardownStrategies } from './types';

class CustomEmitter extends EventEmitter {};

export class Container {
  private readonly _name : symbol;
  private emitter : CustomEmitter = new CustomEmitter;
  public behaviours : Behaviour[] = [];
  private readonly teardownStrategy : TeardownStrategies;
  // public subCastings : Container[]; //not to be done right now

  public get name() : string {
    return getStringFromSymbol(this._name);
  };

  public get identifier() : symbol {
    return this._name;
  }

  public constructor (name : symbol | string, teardownStrategy : TeardownStrategies) {
    this._name = setSymbol(name);
    this.teardownStrategy = teardownStrategy;
  }

  public publish(behaviour : Behaviour) : void {
    this.emitter.emit(behaviour.identifier, behaviour);

    this.teardown();
  }

  private teardown() : void {
    if (this.teardownStrategy === 'none') {
      return;
    }

    if (this.teardownStrategy === 'all') {
      this.behaviours.forEach((behaviour) => {
        this.emitter.removeAllListeners(behaviour.identifier);
      });

      this.behaviours = [];
      return;
    }

    this.filterOnceBehaviours();
  }

  private filterOnceBehaviours() : void {
    const resultingBehaviours : Behaviour[] = this.behaviours.filter((behaviour) => {
      if (behaviour.type === 'once') {
        this.emitter.removeAllListeners(behaviour.identifier);
        return false;
      }
      return true;
    });

    this.behaviours = resultingBehaviours;
  }

  public flush() : void {
    this.teardown();
  }

  private signBehaviourByType(behaviour : Behaviour) : void {
    if (behaviour.type === 'always') {
      this.emitter.on(behaviour.identifier, behaviour.Act);
      return;
    }

    this.emitter.once(behaviour.identifier, behaviour.Act);
    return;
  }

  public sign(behaviour : Behaviour[] | Behaviour) : void {
    if (Array.isArray(behaviour)) {
      behaviour.forEach((event) => {
        this.signBehaviourByType(event);
        this.behaviours.push(event);
      });
      return;
    }

    this.signBehaviourByType(behaviour);
    this.behaviours.push(behaviour);
    return;
  }

  public resign(behaviour : Behaviour[] | Behaviour) : void {
    if (Array.isArray(behaviour)) {
      behaviour.forEach((event) => {
        this.emitter.removeAllListeners(event.identifier);
        const index = this.behaviours.indexOf(event);
        this.behaviours.splice(index, 1);
      });
      return;
    }

    const index = this.behaviours.indexOf(behaviour);
    this.behaviours.splice(index, 1);
  }
};
