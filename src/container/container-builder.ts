import { setSymbol, throwStrategyInvalid } from '../utils/utils';
import { TeardownStrategies, VoidableContainerModifier } from '../utils/types';
import { Behaviour } from '../behaviour/behaviour';
import { Container } from './container';

export class ContainerBuilder {
  private _modifiers : VoidableContainerModifier[] = [];
  protected _identifier : symbol;
  protected _behaviours : Map<symbol, Behaviour> = new Map();
  protected _teardownStrategy : TeardownStrategies;

  public build() : Container {
    return this._instantiate(new Container());
  };

  private _instantiate (thisClass : Container) : Container {
    const result = thisClass;
    this._modifiers.forEach((modifier) => {
      modifier(result);
    });

    this._modifiers = [];
    return result;
  }

  public withIdentifier(identifier : symbol | string) : ContainerBuilder {
    this._newModifier((container : Container) : void => {
      container._identifier = setSymbol(identifier);
    });

    return this;
  }

  public withStrategy(teardownStrategy : TeardownStrategies) : ContainerBuilder {
    throwStrategyInvalid(teardownStrategy);

    this._newModifier((container : Container) : void => {
      container._teardownStrategy = teardownStrategy;
    });

    return this;
  }

  public withBehaviours(behaviours : Behaviour | Behaviour[]) : ContainerBuilder {
    this._newModifier((container : Container) : void => {
      container.sign(behaviours);
    });

    return this;
  }

  private _newModifier(modification : VoidableContainerModifier) : void {
    this._modifiers.push(modification);
  }
};
