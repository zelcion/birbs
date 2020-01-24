import { BirbsOption, BirbsRunnable } from './types';
import { Context } from './context';

/**
 * Is a Birbable instance that can be reused in any Context
 * or Birbable Group
 */
export abstract class Procedure extends BirbsRunnable {
  public readonly __type = 'PROCEDURE';

  public constructor (options : BirbsOption) {
    super(options);

    this.execute = this.execute.bind(this);
  }

  public abstract execute (context : Context) : Promise<void>;
}
