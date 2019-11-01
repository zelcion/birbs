import { Context } from '../context/context';
import { getIdentifierOf } from '../utils/utils';
import { Procedure } from '../procedure/procedure';

export class EventManager {
  private _contexts : Map<symbol, Context> = new Map();

  public addContainer(context : Context) : EventManager {
    this._contexts.set(context.identifier, context);
    return this;
  }

  public removeContainer(context : Context | symbol) : EventManager {
    this._contexts.delete(getIdentifierOf(context));
    return this;
  }

  public fetchContainer(contextIdentifier : symbol) : Context {
    return this._contexts.get(contextIdentifier);
  }

  public broadcast(procedure : Procedure | symbol, context ?: Context | symbol) : EventManager {
    const chosenContainer = (context !== undefined)?
      this._contexts.get(getIdentifierOf(context)) : undefined;

    if (chosenContainer === undefined) {
      this._contexts.forEach(
        (selectedContext) => {
          selectedContext.publish(procedure);
        }
      );

      return this;
    }

    chosenContainer.publish(procedure);
    return this;
  }

  public listen(procedure : Procedure, context : Context | symbol) : EventManager {
    this._contexts.get(getIdentifierOf(context)).sign(procedure);
    return this;
  }

  public removeListener(procedure : Procedure, context : Context | symbol) : EventManager {
    this._contexts.get(getIdentifierOf(context)).resign(procedure);
    return this;
  }

};
