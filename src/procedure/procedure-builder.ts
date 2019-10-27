import { Effect, ProcedureLifecycle, VoidableProcedureModifier } from '../utils/types';
import { setSymbol, throwTypeInvalid } from '../utils/utils';
import { Procedure } from './procedure';

export class ProcedureBuilder {
  private _modifiers : Array<VoidableProcedureModifier> = [];
  protected _identifier : symbol;
  protected _lifecycle : ProcedureLifecycle;
  protected _effects : Effect[] = [];

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
      procedure._effects.push(effect);
    });

    return this;
  }

  private _newModifier(modification : VoidableProcedureModifier) : void {
    this._modifiers.push(modification);
  }
};
