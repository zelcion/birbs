import { Context } from './context';
import { Pipeline } from './pipeline';
import { Procedure } from './procedure';

/**
 * The base class that a context uses to trigger events.
 * @abstract
 */
export abstract class BirbsRunnable {
  private readonly __lifetime : Lifetime;
  private readonly __group ?: symbol;

  /**
   * The lifespan of the Birbable Entity
   * can be either 'SINGLE' or 'DURABLE'
   */
  public get lifetime () : Lifetime {
    return this.__lifetime;
  }

  /**
   * The Birbable group of the procedure or pipeline.
   * Only a single procedure of a group may be executed at a time, others of the
   * same group will be discarded when one is emitted.
   */
  public get group () : symbol {
    return this.__group;
  }

  /**
   * Method used when the Runnable was triggered
   * @param context The context used to execute this function in
   */
  abstract execute (context : Context) : Promise<void>;

  abstract execute (context : Context, descriptable) : Promise<void>;

  public constructor (options : BirbsOption = { lifetime: 'SINGLE' }) {

    this.__lifetime = options.lifetime;

    if (options.group !== undefined) { this.__group = options.group; }
  };

  /**
   * @returns a Boolean representing if the entity belongs to any group
   */
  get belongsToGroup () : boolean {
    return this.__group !== undefined;
  }
}

export type Lifetime = 'DURABLE' | 'SINGLE';

export type BirbsOption = {
  lifetime : Lifetime;
  group ?: symbol;
};

export type Birbable = Procedure | Pipeline;
