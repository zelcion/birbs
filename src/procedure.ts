import { BirbsOption, BirbsRunnable } from './types';
import { Context } from './context';

/**
 * Is a Birbable instance that can be reused in any Context
 * or Birbable Group
 * @abstract
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
   * @async
   * @abstract
   * @warning Do not use this method yourself! It may introduce a state inconsistency to
   * your context.
   *
   * Remember to define the type of the descriptable if you'e useing typescript
   */
  public abstract execute (context : Context, descriptable ?: unknown) : Promise<void>;
}
