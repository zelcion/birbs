import { Context } from './context';
import { getIdentifierOf } from './types';
import { Procedure } from './procedure';

export class EventManager {
  private _contexts : Map<symbol, Context> = new Map();

  public addContext(context : Context) : EventManager {
    this._contexts.set(context.identifier, context);
    return this;
  }

  public removeContext(context : Context | symbol) : EventManager {
    this._contexts.delete(getIdentifierOf(context));
    return this;
  }

  public fetchContext(contextIdentifier : symbol) : Context | undefined {
    return this._contexts.get(contextIdentifier);
  }

  public broadcast(birbable : Procedure | symbol, context ?: Context | symbol) : EventManager {
    const chosenContext = (context !== undefined)?
      this._contexts.get(getIdentifierOf(context)) : undefined;

    if (chosenContext === undefined) {
      this._contexts.forEach(
        (selectedContext) => {
          selectedContext.trigger(getIdentifierOf(birbable));
        }
      );

      return this;
    }

    chosenContext.trigger(getIdentifierOf(birbable));
    return this;
  }

  public addProcedure(procedure : Procedure, context : Context | symbol) : EventManager {
    this._contexts.get(getIdentifierOf(context)).sign(procedure);
    return this;
  }

  public removeProcedure(procedure : Procedure, context : Context | symbol) : EventManager {
    this._contexts.get(getIdentifierOf(context)).unsign(procedure);
    return this;
  }

};
