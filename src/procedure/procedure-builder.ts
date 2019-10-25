import { Action, ProcedureType, VoidableProcedureModifier } from '../utils/types';
import { setSymbol, throwTypeInvalid } from '../utils/utils';
import { Context } from '../context/context';
import { Procedure } from './procedure';

export class ProcedureBuilder {
  private _modifiers : Array<VoidableProcedureModifier> = [];
  protected _identifier : symbol;
  protected _type : ProcedureType;
  protected _actions : Map<symbol, Action> = new Map();
  protected _context : Context;

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

  public withType <T extends Procedure>(this : T, type : ProcedureType) : T {
    throwTypeInvalid(type);

    this._newModifier((procedure : T) : void => {
      procedure._type = type;
    });

    return this;
  }

  public withAction <T extends Procedure>(this : T, action : Action) : T {
    this._newModifier((procedure : T) : void => {
      const actionKey : symbol = setSymbol('unchangeable');

      procedure._actions.set(actionKey, action);
    });

    return this;
  }

  // SAD: For now there is no solution to not use string :(
  // EXPERIMENTAL FEATURE
  public withOwnMethodAsAction <T extends Procedure>(this : T, action : string) : T {
    this._newModifier((procedure : T) : void => {
      const actionKey : symbol = setSymbol('unchangeable');
      if (typeof procedure[action] !== 'function') {
        throw new Error('Action must be a name of a method of your Procedure');
      }

      procedure[action] = procedure[action].bind(procedure);
      procedure._actions.set(actionKey, procedure[action]);
      procedure[action]();
    });

    return this;
  }

  private _newModifier(modification : VoidableProcedureModifier) : void {
    this._modifiers.push(modification);
  }
};
