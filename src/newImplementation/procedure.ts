import { BirbsOption, BirbsRunnable, Identifier } from './types';
import { Context } from './context';

/**
 * Is a Birbable instance that can be reused in any Context
 * or Birbable Group
 */
export abstract class Procedure extends BirbsRunnable {
  public constructor (options : BirbsOption) {
    super(options);

    this.execute = this.execute.bind(this);
  }

  public readonly __type = 'PROCEDURE';

  public abstract execute (context : Context, identifier : Identifier) : Promise<void>;
}
