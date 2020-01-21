import { Effect, ProcedureLifecycle, ProcedureOptions, VoidableProcedureModifier } from '../utils/types';
import { setSymbol, throwInvalidProcedureLifecycle } from '../utils/utils';
import {
  throwMethodNotPresent,
  throwNoActions,
  throwNoIdentifier,
  throwTargetAlreadyBuilt,
  throwWrongType
} from '../utils/error-handler';
import { Pipeline } from './pipeline';
import { Procedure } from './procedure';

export class ProcedureBuilder {
  private _modifiers : Array<VoidableProcedureModifier> | null = [];
  protected _identifier : symbol;
  protected _lifecycle : ProcedureLifecycle;
  protected _effects : Effect[] = [];
  protected _pipelines : Pipeline[] = [];

  public build <T extends Procedure>(this : T, options ?: ProcedureOptions) : T{
    throwTargetAlreadyBuilt(this._modifiers);

    this._modifiers.forEach((modifier) => {
      modifier(this);
    });

    if (options !== undefined) this._applyOptions(options);

    throwNoActions(this);
    throwNoIdentifier(this);

    this._modifiers = null;
    return this;
  };

  private _applyOptions <T extends Procedure>(this : T, options : ProcedureOptions) : void {
    if (options.effects !== undefined && Array.isArray(options.effects)) {
      this._effects = options.effects;
    }

    if (options.identifier !== undefined) {
      this._identifier = setSymbol(options.identifier);
    }

    if (options.lifecycle !== undefined) {
      this._lifecycle = options.lifecycle;
    }
  }

  public withIdentifier <T extends Procedure>(this : T, identifier : symbol | string) : T {
    throwTargetAlreadyBuilt(this._modifiers);
    throwWrongType(identifier, ['symbol', 'string']);

    this._newModifier((procedure : T) : void => {
      procedure._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withLifecycle <T extends Procedure>(this : T, lifecycle : ProcedureLifecycle) : T {
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

  public withPipeline <T extends Procedure>(pipeline : Pipeline) : this {
    throwTargetAlreadyBuilt(this._modifiers);

    this._newModifier((procedure : T) : void => {
      procedure._pipelines.push(pipeline);
    });

    return this;
  }

  private _newModifier(modification : VoidableProcedureModifier) : void {
    this._modifiers.push(modification);
  }
};
