import { ContextOptions, FlushingStrategies, VoidableContainerModifier } from '../utils/types';
import { setSymbol, throwStrategyInvalid } from '../utils/utils';
import { throwNoFlushingStrategy, throwNoIdentifier, throwTargetAlreadyBuilt } from '../utils/error-handler';
import { Context } from './context';
import { Procedure } from '../procedure/procedure';

export class ContextBuilder {
  private _modifiers : VoidableContainerModifier[] | null = [];
  protected _identifier : symbol;
  protected _procedures : Map<symbol, Procedure> = new Map();
  protected _flushingStrategy : FlushingStrategies;

  public build<T extends Context>(this : T, options ?: ContextOptions) : T {
    throwTargetAlreadyBuilt(this._modifiers);

    this._modifiers.forEach((modifier) => {
      modifier(this);
    });

    if (options !== undefined) this._applyOptions(options);

    throwNoFlushingStrategy(this);
    throwNoIdentifier(this);
    this._modifiers = null;

    return this;
  };

  private _applyOptions <T extends Context>(this : T, options :  ContextOptions) : void {
    if (options.identifier !== undefined) {
      this._identifier = setSymbol(options.identifier);
    }

    if (options.strategy !== undefined) {
      this._flushingStrategy = options.strategy;
    }
  }

  public withIdentifier<T extends Context>(this : T, identifier : symbol | string) : T {
    throwTargetAlreadyBuilt(this._modifiers);

    this._newModifier((context : Context) : void => {
      context._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withStrategy<T extends Context>(this : T, flushingStrategy : FlushingStrategies) : T {
    throwTargetAlreadyBuilt(this._modifiers);
    throwStrategyInvalid(flushingStrategy);

    this._newModifier((context : Context) : void => {
      context._flushingStrategy = flushingStrategy;
    });

    return this;
  }

  public withProcedures<T extends Context>(this : T, procedures : Procedure | Procedure[]) : T {
    throwTargetAlreadyBuilt(this._modifiers);

    this._newModifier((context : Context) : void => {
      context.sign(procedures);
    });

    return this;
  }

  private _newModifier(modification : VoidableContainerModifier) : void {
    this._modifiers.push(modification);
  }
};
