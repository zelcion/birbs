import { Action, BehaviourType, VoidableBehaviourModifier } from '../types';
import { setSymbol, throwTypeInvalid } from '../utils';
import { Behaviour } from './behaviour';

export class BehaviourBuilder {
  private _modifiers : Array<VoidableBehaviourModifier> = [];
  protected _identifier : symbol;
  public type : BehaviourType;
  protected actions : Map<symbol, Action> = new Map();

  public build <T extends Behaviour>(extended ?: new() => T) : T {
    const result = (extended)? new extended() : new Behaviour();
    return this._instantiate(result) as T;
  };

  private _instantiate (thisClass : Behaviour) : Behaviour {
    const result = thisClass;
    this._modifiers.forEach((modifier) => {
      modifier(result);
    });

    this._modifiers = [];
    return result;
  }

  public withIdentifier(identifier : symbol | string) : BehaviourBuilder {
    this._newModifier((behaviour : Behaviour) : void => {
      behaviour._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withType(type : BehaviourType) : BehaviourBuilder {
    throwTypeInvalid(type);

    this._newModifier((behaviour : Behaviour) : void => {
      behaviour.type = type;
    });

    return this;
  }

  public withAction(action : Action) : BehaviourBuilder {
    this._newModifier((behaviour : Behaviour) : void => {
      const actionKey : symbol = setSymbol('unchangeable');

      behaviour.actions.set(actionKey, action);
    });

    return this;
  }

  private _newModifier(modification : VoidableBehaviourModifier) : void {
    this._modifiers.push(modification);
  }
};
