import { Effect, ProcedureLifecycle, VoidableProcedureModifier } from '../utils/types';
import { setSymbol, throwInvalidProcedureLifecycle } from '../utils/utils';
import {
  throwMethodNotPresent,
  throwNoEffects,
  throwNoIdentifier,
  throwTargetAlreadyBuilt,
  throwWrongType
} from '../utils/error-handler';
import { Procedure } from './procedure';

export class ProcedureBuilder {
  private _modifiers : Array<VoidableProcedureModifier> | null = [];
  protected _identifier : symbol;
  protected _lifecycle : ProcedureLifecycle;
  protected _effects : Effect[] = [];

  public get effects () : Effect[] {
    return this._effects;
  }

  public build <T extends Procedure>(this : T) : T{
    throwTargetAlreadyBuilt(this._modifiers);

    this._modifiers.forEach((modifier) => {
      modifier(this);
    });

    throwNoEffects(this);
    throwNoIdentifier(this);

    this._modifiers = null;
    return this;
  };

  public withIdentifier <T extends Procedure>(this : T, identifier : symbol | string) : T {
    throwTargetAlreadyBuilt(this._modifiers);
    throwWrongType(identifier, ['symbol', 'string']);

    this._newModifier((procedure : T) : void => {
      procedure._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withType <T extends Procedure>(this : T, lifecycle : ProcedureLifecycle) : T {
    throwTargetAlreadyBuilt(this._modifiers);
    throwInvalidProcedureLifecycle(lifecycle);

    this._newModifier((procedure : T) : void => {
      procedure._lifecycle = lifecycle;
    });

    return this;
  }

  public withEffect <T extends Procedure>(this : T, effect : Effect) : T {
    throwTargetAlreadyBuilt(this._modifiers);
    throwMethodNotPresent(effect, 'execution', 'Effect');

    this._newModifier((procedure : T) : void => {
      procedure._effects.push(effect);
    });

    return this;
  }

  private _newModifier(modification : VoidableProcedureModifier) : void {
    this._modifiers.push(modification);
  }
};
