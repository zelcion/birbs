import { Birbable, TriggerOptions } from './types';
import { BroadcastsRecorder } from './broadcasts-recorder';
import { Context } from './context';

/**
 * Holds Contexts and broadcasts events to them
 */
export class EventManager {
  /**
   * @private
   * @readonly A Map of added contexts
   */
  private readonly __contexts : Map<string | symbol, Context> = new Map();

  /**
   * @public
   * @readonly The dump controller for this instance of the EventManager
   */
  public readonly broadcasts ?: BroadcastsRecorder;

  public constructor (
    broadcasts ?: BroadcastsRecorder
  ) {
    this.broadcasts = broadcasts;
  }

  /**
   * Adds a context to this event manager.
   * @param context
   */
  public addContext(context : Context) : EventManager {
    this.__contexts.set(context.identifier, context);
    return this;
  }

  /**
   * Removes a context from this event manager.
   * @param contexName
   */
  public removeContext(contexName : string | symbol) : EventManager {
    this.__contexts.delete(contexName);
    return this;
  }

  /**
   * Broadcasts a Birbable to a specific context on this manager, or to all of them
   * @param options The configuration for this broadcast
   * @param descriptable Optional - Additional info to be sent to the Birbable
   */
  public broadcast<T>(options : TriggerOptions, descriptable ?: T) : EventManager {
    const chosenContext = (options.context !== undefined)?
      this.__contexts.get(options.context) : undefined;

    if (chosenContext === undefined) {
      this.__contexts.forEach(
        (currentContext) => {
          currentContext.trigger(options, descriptable);
          this.broadcasts?.writeState(options.birbable, currentContext, descriptable);
        }
      );

      return this;
    }

    chosenContext.trigger(options, descriptable);
    this.broadcasts?.writeState(options.birbable, chosenContext, descriptable);
    return this;
  }

  /**
   * Signs a Birbable to a Context
   * @param birbable The birbable to add
   * @param context The context to add the birbable to
   */
  public addBirbable(birbable : Birbable, context : string | symbol) : EventManager {
    this.__contexts.get(context).sign(birbable);
    return this;
  }

  /**
   * Removes a Birbable from a Context
   * @param birbable The birbable to remove
   * @param context The context to remove the birbable from
   */
  public removeBirbable(birbable : Birbable, context : string | symbol) : EventManager {
    this.__contexts.get(context).unsign(birbable);
    return this;
  }
};
