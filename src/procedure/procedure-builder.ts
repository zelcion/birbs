import { Effect, ProcedureLifecycle, VoidableProcedureModifier } from '../utils/types';
import { setSymbol, throwTypeInvalid } from '../utils/utils';
import { Procedure } from './procedure';

export class ProcedureBuilder {
  private _modifiers : Array<VoidableProcedureModifier> = [];
  protected _identifier : symbol;
  protected _lifecycle : ProcedureLifecycle;
  protected _effects : Map<symbol, Effect> = new Map();
  // TODO: Make effects an array because they don't need to be retrieved

  public build <T extends Procedure>(this : T) : T{
    this._modifiers.forEach((modifier) => {
      modifier(this);
    });

    this._modifiers = [];
    return this;
  };

  public withIdentifier <T extends Procedure>(this : T, identifier : symbol | string) : T {
    this._newModifier((procedure : T) : void => {
      procedure._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withType <T extends Procedure>(this : T, lifecycle : ProcedureLifecycle) : T {
    throwTypeInvalid(lifecycle);

    this._newModifier((procedure : T) : void => {
      procedure._lifecycle = lifecycle;
    });

    return this;
  }

  public withEffect <T extends Procedure>(this : T, effect : Effect) : T {
    this._newModifier((procedure : T) : void => {
      const effectKey : symbol = setSymbol('unchangeable');

      procedure._effects.set(effectKey, effect);
    });

    return this;
  }

  // SAD: For now there is no solution to not use string :(
  // EXPERIMENTAL FEATURE
  public withOwnMethodAsEffect <T extends Procedure>(this : T, effect : string) : T {
    this._newModifier((procedure : T) : void => {
      const effectKey : symbol = setSymbol('unchangeable');
      if (typeof procedure[effect] !== 'function') {
        throw new Error('Effect must be a name of a method of your Procedure');
      }

      procedure[effect] = procedure[effect].bind(procedure);
      procedure._effects.set(effectKey, procedure[effect]);
      procedure[effect]();
    });

    return this;
  }

  private _newModifier(modification : VoidableProcedureModifier) : void {
    this._modifiers.push(modification);
  }
};
