import { Birbable, HandlerFunction, TriggerOptions } from './types';

type ContextOptions = { identifier : string | symbol; errorHandler ?: HandlerFunction };

/**
 * Context defines a group of information available to a Procedure when
 * it gets executed. A context may have any Bibrbable instance signed on it.
 */
export class Context {
  /**
   * @readonly @private identifier of the context entity
   */
  private readonly __identifier : string | symbol;

  /**
   * @readonly @private error handler of errors that might happen
   * while executing proedures
   */
  private readonly __errorHandler ?: HandlerFunction;

  /**
   * @readonly @private Map of Birbables registered in the context
   */
  private readonly __birbables : Map<string, Birbable> = new Map();

  /**
   * @returns identifier of the context entity
   */
  public get identifier () : string | symbol {
    return this.__identifier;
  }

  /**
   * @param identifier The value to set the local identifier of the context
   */
  public constructor (contextOtions : ContextOptions) {
    this.__identifier = contextOtions.identifier;
    this.__errorHandler = contextOtions.errorHandler?.bind(this);
  }

  /**
   * Triggers the execution of a signed `Birbable`.
   * @param name Identifier of what needs to be triggered in this context
   * @param descriptable Additional Information to be sent to the Birbable
   * @param errorHandler A function to catch errors in case of unexpected promise Rejections
   */
  public trigger <T>(options : TriggerOptions, descriptable ?: T) : this {
    const foundBirbable = this.__birbables.get(options.birbable);
    if (foundBirbable === undefined) {
      return this;
    }

    this.__unmount(foundBirbable);

    const execution = foundBirbable.execute(this, descriptable);

    if (execution instanceof Promise) {
      execution.catch(this.__activeErrorHandler(options.errorHandler));
    }

    return this;
  }

  private __activeErrorHandler (errorHandler ?: HandlerFunction) : HandlerFunction {
    const defaultHandler = (error : Error) : void => {
      console.log(`The context "${this.constructor.name}" had an Unhandled Promise Rejection.`);

      throw error;
    };

    return (this.__errorHandler ?? errorHandler) ?? defaultHandler;
  }

  /**
   * Removes a birbable which is about to be triggered
   * @private
   * @param birbable
   */
  private __unmount (birbable : Birbable) : void {
    if (birbable.belongsToGroup) { return this.__clearGroup(birbable.group); }

    if (birbable.lifetime === 'SINGLE') { this.__birbables.delete(birbable.constructor.name); }
  }

  /**
   * Removes a whole group of birbables
   * @private
   * @param group a symbol marking the group to be removed
   */
  private __clearGroup (group : symbol) : void {
    const groupEntities : Birbable[] = [];
    this.__birbables.forEach((birbable) => {
      if (birbable.group === group) { groupEntities.push(birbable); }
    });

    groupEntities.forEach((groupedBirbable) => {
      this.__birbables.delete(groupedBirbable.constructor.name);
    });
  }

  /**
   * Signs a Birbable in your context. Only signed Birbables can be triggered
   * @param birbable
   */
  public sign (birbable : Birbable) : this {
    this.__birbables.set(birbable.constructor.name, birbable);
    // this.__addToListener(birbable);

    return this;
  }

  /**
   * Usigns a Birbable from the context.
   * @param birbable Any Birbable that was signed before in this context
   */
  public unsign (birbable : Birbable) : this {
    const foundBirbable = this.__birbables.get(birbable.constructor.name);

    if (foundBirbable !== undefined) {
      this.__birbables.delete(birbable.constructor.name);
      // this.__emitter.removeAllListeners(birbable.constructor.name);
    }

    return this;
  }
}
