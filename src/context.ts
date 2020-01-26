import { Birbable } from './types';
import { EventEmitter } from 'events';

/**
 * Context defines a group of information available to a Procedure when
 * it gets executed. A context may have any Bibrbable instance signed on it.
 */
export class Context {
  /**
   * @readonly @private identifier of the context entity
   */
  private readonly __identifier : string;

  /**
   * @readonly @private Local EventEmmiter instance
   */
  private readonly __emitter : EventEmitter = new EventEmitter();

  /**
   * @readonly @private Map of Birbables registered in the context
   */
  private readonly __birbables : Map<string, Birbable> = new Map();

  /**
   * @returns identifier of the context entity
   */
  public get identifier () : string {
    return this.__identifier;
  }

  /**
   * @param identifier The value to set the local identifier of the context
   */
  public constructor (identifier : string) {
    this.__identifier = identifier;
  }

  /**
   * Executes an Executable entity
   * @param name Identifier of what needs to be triggered in this context
   */
  public trigger (name : string) : this {
    if (!this.__birbables.has(name)) {
      return this;
    }

    this.__unmount(this.__birbables.get(name));
    this.__emitter.emit(name, this);
    return this;
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
    this.__addToListener(birbable);

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
      this.__emitter.removeAllListeners(birbable.constructor.name);
    }

    return this;
  }

  /**
   * Adds a listener of a birbable to the context
   * @private
   * @param birbable
   */
  private __addToListener (birbable : Birbable) : void {
    if (birbable.belongsToGroup) {
      this.__emitter.once(birbable.constructor.name, birbable.execute);
      return;
    }

    const method = birbable.lifetime === 'DURABLE' ? 'on' : 'once';
    this.__emitter[method](birbable.constructor.name, birbable.execute);
  }
}
