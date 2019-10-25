import { getIdentifierOf, getStringFromSymbol } from '../utils/utils';
import { Behaviour } from '../behaviour/behaviour';
import { BehaviourType } from '../utils/types';
import { ContainerBuilder } from './container-builder';
import { EventEmitter } from 'events';

class CustomEmitter extends EventEmitter {};

export class Container extends ContainerBuilder{
  private _emitter : CustomEmitter = new CustomEmitter;

  public get name() : string {
    return getStringFromSymbol(this._identifier);
  };

  public get identifier() : symbol {
    return this._identifier;
  }

  public getEmitter(identifier : symbol) : CustomEmitter {
    if (identifier === this.identifier) {
      return this._emitter;
    }
  }

  public publish(behaviour : Behaviour | symbol) : void {
    const behaviourToBeEmitted : Behaviour = (typeof behaviour === 'symbol')?
      this._behaviours.get(behaviour) :
      behaviour;

    this._emitter.emit(behaviourToBeEmitted.identifier, behaviourToBeEmitted);

    this._teardown();
  }

  private _teardown() : void {
    if (this._teardownStrategy === 'none') {
      return;
    }

    if (this._teardownStrategy === 'all') {
      this._behaviours.forEach((behaviour) => {
        this._emitter.removeAllListeners(behaviour.identifier);
      });

      this._behaviours = new Map();
      return;
    }

    this._filterOnceBehaviours();
  }

  private _filterOnceBehaviours() : void {
    this._behaviours.forEach((behaviour) => {
      if (behaviour.type === 'once') this._emitter.removeAllListeners(behaviour.identifier);
    });

    this._getBehaviourListByType('once').forEach((behaviour) => {
      this._behaviours.delete(behaviour.identifier);
    });
  }

  private _getBehaviourListByType(type : BehaviourType) : Behaviour[] {
    const list : Behaviour[] = [];
    this._behaviours.forEach((behaviour) => {
      if (behaviour.type === type) list.push(behaviour);
    });

    return list;
  }

  public signBehaviourByType(behaviour : Behaviour) : void {
    behaviour.setContext(this);

    if (behaviour.type === 'always') {
      this._emitter.on(behaviour.identifier, behaviour.Act);
      this._behaviours.set(behaviour.identifier, behaviour);
      return;
    }

    this._emitter.once(behaviour.identifier, behaviour.Act);
    this._behaviours.set(behaviour.identifier, behaviour);
    return;
  }

  public flush() : void {
    this._teardown();
  }

  public sign(behaviour : Behaviour[] | Behaviour) : Container {
    if (Array.isArray(behaviour)) {
      behaviour.forEach((event) => {
        this.signBehaviourByType(event);
      });
      return;
    }

    this.signBehaviourByType(behaviour);
    return this;
  }

  public resign(behaviour : Behaviour[] | Behaviour | symbol[] | symbol) : Container {
    if (Array.isArray(behaviour)) {
      behaviour.forEach((event : symbol | Behaviour) => {
        this._emitter.removeAllListeners(getIdentifierOf(event));
        this._behaviours.delete(getIdentifierOf(event));
      });
      return;
    }

    this._behaviours.delete(getIdentifierOf(behaviour));
    return this;
  }

  public getBehaviour(behaviourId : symbol) : Behaviour | undefined{
    return this._behaviours.get(behaviourId);
  }

  public hasBehaviour(behaviour : symbol | Behaviour) : boolean {
    return this._behaviours.has(getIdentifierOf(behaviour));
  }

  // Add Actions to Behaviours [By Symbol or By itself]
};
