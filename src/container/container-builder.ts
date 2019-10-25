import { setSymbol, throwStrategyInvalid } from '../utils/utils';
import { TeardownStrategies, VoidableContainerModifier } from '../utils/types';
import { Behaviour } from '../behaviour/behaviour';
import { Container } from './container';

export class ContainerBuilder {
  private _modifiers : VoidableContainerModifier[] = [];
  protected _identifier : symbol;
  protected _behaviours : Map<symbol, Behaviour> = new Map();
  protected _teardownStrategy : TeardownStrategies;

  public build<T extends Container>(this : T) : T {
    this._modifiers.forEach((modifier) => {
      modifier(this);
    });

    this._modifiers = [];
    return this;
  };

  public withIdentifier<T extends Container>(this : T, identifier : symbol | string) : T {
    this._newModifier((container : Container) : void => {
      container._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withStrategy<T extends Container>(this : T, teardownStrategy : TeardownStrategies) : T {
    throwStrategyInvalid(teardownStrategy);

    this._newModifier((container : Container) : void => {
      container._teardownStrategy = teardownStrategy;
    });

    return this;
  }

  public withBehaviours<T extends Container>(this : T, behaviours : Behaviour | Behaviour[]) : T {
    this._newModifier((container : Container) : void => {
      container.sign(behaviours);
    });

    return this;
  }

  private _newModifier(modification : VoidableContainerModifier) : void {
    this._modifiers.push(modification);
  }
};
