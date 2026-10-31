import { Context } from './context';
import { Pipeline } from './pipeline';
import { Procedure } from './procedure';

export type HandlerFunction = (error : Error) => void;

/**
 * The shape of the observable state bag held by a Context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextData<D = any> = Partial<D>;

/**
 * Payload emitted on the Context "state" event whenever observable context
 * state changes. Lets Procedures, Pipelines and external observers react to
 * a state transition instead of only being triggered explicitly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextStateChange<D = any> = {
  /** The context whose state changed. */
  context : Context<D>;
  /** The full current state of the context. */
  state : ContextData<D>;
  /** Keys that were added or overwritten by the change. */
  changed : string[];
};
export type TriggerOptions = {
  context ?: symbol | string;
  birbable : string;
  errorHandler ?: HandlerFunction;
};

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

  abstract execute (context : Context, descriptable ?: unknown) : Promise<void>;

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

export enum BroadcastsRecorderEvents {
  WRITE = 'write',
  DUMP = 'dump',
  READ = 'read'
};
