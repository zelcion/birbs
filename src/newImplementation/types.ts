import { BirbableGroup } from './birbable-group';
import { Context } from './context';
import { Pipeline } from './pipeline';
import { Procedure } from './procedure';
import { setSymbol } from '../utils/utils';

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
  public readonly lifetime : Lifetime;

  /**
   * Method used when the Runnable was triggered
   * @param context The context used to execute this function in
   */
  abstract execute (context : Context, identifier ?: symbol) : Promise<void>;

  public constructor (options : BirbsOption = { identifier: Symbol('default'), lifetime: 'SINGLE' }) {
    super(options.identifier);

    this.lifetime = options.lifetime;
  };
}

export type Identifier = string | symbol;
export type Lifetime = 'DURABLE' | 'SINGLE';

export type BirbsOption = {
  identifier : Identifier;
  lifetime : Lifetime;
};

export type Birbable = Procedure | Pipeline | BirbableGroup;

export const getIdentifierOf = (identity : Identifiable | symbol) : symbol => {
  if (typeof identity === 'symbol') return identity;

  return identity.identifier;
};
