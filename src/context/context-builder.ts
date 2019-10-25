import { setSymbol, throwStrategyInvalid } from '../utils/utils';
import { TeardownStrategies, VoidableContainerModifier } from '../utils/types';
import { Behaviour } from '../behaviour/behaviour';
import { Context } from './context';

export class ContextBuilder {
  private _modifiers : VoidableContainerModifier[] = [];
  protected _identifier : symbol;
  protected _behaviours : Map<symbol, Behaviour> = new Map();
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

  public withBehaviours<T extends Context>(this : T, behaviours : Behaviour | Behaviour[]) : T {
    this._newModifier((container : Context) : void => {
      container.sign(behaviours);
    });

    return this;
  }

  private _newModifier(modification : VoidableContainerModifier) : void {
    this._modifiers.push(modification);
  }
};
