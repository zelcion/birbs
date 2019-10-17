import { Action, BehaviourType, VoidableBehaviourModifier } from '../types';
import { setSymbol, throwTypeInvalid } from '../utils';

export class Behaviour {
  // Builder --------
  private _modifiers : Array<VoidableBehaviourModifier> = [];

  public build <T extends Behaviour>(extended ?: new() => T) : T {
    const result = (extended)? new extended() : undefined;
    return this._instantiate(result || this) as T;
  };

  private _instantiate (thisClass : Behaviour) : Behaviour {
    const result = thisClass;
    this._modifiers.forEach((modifier) => {
      modifier(result);
    });

    this._modifiers = [];
    return result;
  }

  public withIdentifier(identifier : symbol | string) : Behaviour {
    this._newModifier((behaviour : Behaviour) : void => {
      behaviour._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withType(type : BehaviourType) : Behaviour {
    throwTypeInvalid(type);

    this._newModifier((behaviour : Behaviour) : void => {
      behaviour.type = type;
    });

    return this;
  }

  public withAction(action : Action) : Behaviour {
    this._newModifier((behaviour : Behaviour) : void => {
      const actionKey : symbol = setSymbol('unchangeable');

      behaviour.actions.set(actionKey, action);
    });

    return this;
  }

  private _newModifier(modification : VoidableBehaviourModifier) : void {
    this._modifiers.push(modification);
  }

  // Class -------------------
  private _identifier : symbol;
  public type : BehaviourType;
  private actions : Map<symbol, Action> = new Map();

  public get identifier() : symbol {
    return this._identifier;
  }

  public constructor () {
    this.Act = this.Act.bind(this);
  }

  public async Act() : Promise<void> {
    const executionCompletion = [];
    this.actions.forEach((action) => {
      executionCompletion.push(action(this));
    });

    await Promise.all(executionCompletion);
    return;
  }

};
