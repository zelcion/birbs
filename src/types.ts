import { Context } from './context';
import { Pipeline } from './pipeline';
import { Procedure } from './procedure';

export const setSymbol = (entry : Identifier) : symbol => {
  let result : symbol;
  if (typeof entry === 'string') {
    result = Symbol(entry);
    return result;
  }

  result = entry;
  return result;
};

export abstract class Identifiable {
  private readonly _identifier : symbol;

  /**
   * The identifier of this Entity
   */
  get identifier() : symbol {
    return this._identifier;
  };

  public constructor (identifier : Identifier) {
    this._identifier = setSymbol(identifier);
  }
}

export abstract class BirbsRunnable extends Identifiable {
  public readonly __lifetime : Lifetime;
  public readonly __group ?: symbol;
  /**
   * Method used when the Runnable was triggered
   * @param context The context used to execute this function in
   */
  abstract execute (context : Context) : Promise<void>;

  public constructor (options : BirbsOption = { identifier: Symbol('default'), lifetime: 'SINGLE' }) {
    super(options.identifier);

    this.__lifetime = options.lifetime;

    if (options.group !== undefined) { this.__group = options.group; }
  };

  get belongsToGroup () : boolean {
    return this.__group !== undefined;
  }
}

export type Identifier = string | symbol;
export type Lifetime = 'DURABLE' | 'SINGLE';

export type BirbsOption = {
  identifier : Identifier;
  lifetime : Lifetime;
  group ?: symbol;
};

export type Birbable = Procedure | Pipeline;

export const getIdentifierOf = (identity : Identifiable | symbol) : symbol => {
  if (typeof identity === 'symbol') return identity;

  return identity.identifier;
};
