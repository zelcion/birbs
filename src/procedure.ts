import { BirbsOption, BirbsRunnable } from './types';
import { Context } from './context';

/**
 * Is a Birbable instance that can be reused in any Context
 * or Birbable Group
 */
export abstract class Procedure extends BirbsRunnable {
  /**
   * Used internally by Birbs to evaluate the type of the Birbable instance
   */
  public readonly __type = 'PROCEDURE';

  public constructor (options : BirbsOption) {
    super(options);

    this.execute = this.execute.bind(this);
  }

  /**
   * It is the method used when the procedure is to be executed
   * @warning Do not use this method yourself! It may introduce a state inconsistency to
   * your context.
   */
  public abstract execute (context : Context) : Promise<void>;
}
