import { BirbsRunnable, Identifier } from './types';
import { Context } from './context';

/**
 * Is a Birbable instance that can be reused in any Context
 * or Birbable Group
 */
export abstract class Procedure extends BirbsRunnable {
  public readonly __type = 'PROCEDURE';

  public abstract execute <T extends Context>(context : T, identifier : Identifier) : Promise<void>;
}
