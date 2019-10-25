import { setSymbol, throwStrategyInvalid } from '../utils/utils';
import { TeardownStrategies, VoidableContainerModifier } from '../utils/types';
import { Context } from './context';
import { Procedure } from '../procedure/procedure';

export class ContextBuilder {
  private _modifiers : VoidableContainerModifier[] = [];
  protected _identifier : symbol;
  protected _procedures : Map<symbol, Procedure> = new Map();
  protected _teardownStrategy : TeardownStrategies;

  public build<T extends Context>(this : T) : T {
    this._modifiers.forEach((modifier) => {
      modifier(this);
    });

    this._modifiers = [];
    return this;
  };

  public withIdentifier<T extends Context>(this : T, identifier : symbol | string) : T {
    this._newModifier((container : Context) : void => {
      container._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withStrategy<T extends Context>(this : T, teardownStrategy : TeardownStrategies) : T {
    throwStrategyInvalid(teardownStrategy);

    this._newModifier((container : Context) : void => {
      container._teardownStrategy = teardownStrategy;
    });

    return this;
  }

  public withProcedures<T extends Context>(this : T, procedures : Procedure | Procedure[]) : T {
    this._newModifier((container : Context) : void => {
      container.sign(procedures);
    });

    return this;
  }

  private _newModifier(modification : VoidableContainerModifier) : void {
    this._modifiers.push(modification);
  }
};
