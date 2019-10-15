import { getStringFromSymbol, setSymbol } from './utils';
import { Behaviour } from './behaviour';
import { BehaviourType } from './types';
import EventEmitter from 'events';
import { TeardownStrategies } from './types';

class CustomEmitter extends EventEmitter {};

export class Container {
  private readonly _name : symbol;
  private emitter : CustomEmitter = new CustomEmitter;
  public behaviours : Map<symbol, Behaviour> = new Map();
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

  public publish(behaviour : Behaviour | symbol) : void {
    const behaviourToBeEmitted : Behaviour = (typeof behaviour === 'symbol')?
      this.behaviours.get(behaviour) :
      behaviour;

    this.emitter.emit(behaviourToBeEmitted.identifier, behaviourToBeEmitted);

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

      this.behaviours = new Map();
      return;
    }

    this.filterOnceBehaviours();
  }

  private filterOnceBehaviours() : void {
    this.behaviours.forEach((behaviour) => {
      if (behaviour.type === 'once') this.emitter.removeAllListeners(behaviour.identifier);
    });

    this.getBehaviourListByType('once').forEach((behaviour) => {
      this.behaviours.delete(behaviour.identifier);
    });
  }

  private getBehaviourListByType(type : BehaviourType) : Behaviour[] {
    const list : Behaviour[] = [];
    this.behaviours.forEach((behaviour) => {
      if (behaviour.type === type) list.push(behaviour);
    });

    return list;
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
        this.behaviours.set(event.identifier, event);
      });
      return;
    }

    this.signBehaviourByType(behaviour);
    this.behaviours.set(behaviour.identifier, behaviour);
    return;
  }

  public resign(behaviour : Behaviour[] | Behaviour) : void {
    if (Array.isArray(behaviour)) {
      behaviour.forEach((event) => {
        this.emitter.removeAllListeners(event.identifier);
        this.behaviours.delete(event.identifier);
      });
      return;
    }

    this.behaviours.delete(behaviour.identifier);
  }

  // Add Actions to Behaviours [By Symbol or By itself]
};
