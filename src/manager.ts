import { Birbable } from './types';
import { Context } from './context';

/**
 * Holds Contexts and broadcasts events to them
 */
export class EventManager {
  private _contexts : Map<string, Context> = new Map();

  /**
   * Adds a context to this event manager.
   * @param context
   */
  public addContext(context : Context) : EventManager {
    this._contexts.set(context.constructor.name, context);
    return this;
  }

  /**
   * Removes a context from this event manager.
   * @param contexName
   */
  public removeContext(contexName : string) : EventManager {
    this._contexts.delete(contexName);
    return this;
  }

  /**
   * Broadcasts a Birbable to a specific context on this manager, or to all of them
   * @param birbable The specified name of the birbable entity
   * @param context Optional - the context to trigger the Birbable
   */
  public broadcast(birbable : string, context ?: string) : EventManager {
    const chosenContext = (context !== undefined)?
      this._contexts.get(context) : undefined;

    if (chosenContext === undefined) {
      this._contexts.forEach(
        (selectedContext) => {
          selectedContext.trigger(birbable);
        }
      );

      return this;
    }

    chosenContext.trigger(birbable);
    return this;
  }

  /**
   * Signs a Birbable to a Context
   * @param birbable The birbable to add
   * @param context The context to add the birbable to
   */
  public addProcedure(birbable : Birbable, context : string) : EventManager {
    this._contexts.get(context).sign(birbable);
    return this;
  }

  /**
   * Removes a Birbable from a Context
   * @param birbable The birbable to remove
   * @param context The context to remove the birbable from
   */
  public removeProcedure(birbable : Birbable, context : string) : EventManager {
    this._contexts.get(context).unsign(birbable);
    return this;
  }
};
