import { Action, BehaviourType, VoidableBehaviourModifier } from '../utils/types';
import { setSymbol, throwTypeInvalid } from '../utils/utils';
import { Behaviour } from './behaviour';
import { Container } from '../container/container';

export class BehaviourBuilder {
  private _modifiers : Array<VoidableBehaviourModifier> = [];
  protected _identifier : symbol;
  protected _type : BehaviourType;
  protected _actions : Map<symbol, Action> = new Map();
  protected _context : Container;

  public build <T extends Behaviour>(this : T) : T{
    this._modifiers.forEach((modifier) => {
      modifier(this);
    });

    this._modifiers = [];
    return this;
  };

  public withIdentifier <T extends Behaviour>(this : T, identifier : symbol | string) : T {
    this._newModifier((behaviour : T) : void => {
      behaviour._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withType <T extends Behaviour>(this : T, type : BehaviourType) : T {
    throwTypeInvalid(type);

    this._newModifier((behaviour : T) : void => {
      behaviour._type = type;
    });

    return this;
  }

  public withAction <T extends Behaviour>(this : T, action : Action) : T {
    this._newModifier((behaviour : T) : void => {
      const actionKey : symbol = setSymbol('unchangeable');

      behaviour._actions.set(actionKey, action);
    });

    return this;
  }

  // SAD: For now there is no solution to not use string :(
  // EXPERIMENTAL FEATURE
  public withOwnMethodAsAction <T extends Behaviour>(this : T, action : string) : T {
    this._newModifier((behaviour : T) : void => {
      const actionKey : symbol = setSymbol('unchangeable');
      if (typeof behaviour[action] !== 'function') {
        throw new Error('Action must be a name of a method of your Behaviour');
      }

      behaviour[action] = behaviour[action].bind(behaviour);
      behaviour._actions.set(actionKey, behaviour[action]);
      behaviour[action]();
    });

    return this;
  }

  private _newModifier(modification : VoidableBehaviourModifier) : void {
    this._modifiers.push(modification);
  }
};
