import { Birbable } from './types';
import { EventEmitter } from 'events';

/**
 * Context defines a group of information available to a Procedure when
 * it gets executed. A context may have any Bibrbable instance signed on it.
 */
export class Context {
  private readonly emitter : EventEmitter = new EventEmitter();
  private readonly birbables : Map<string, Birbable> = new Map();

  /**
   * Executes an Executable entity
   * @param name Identifier of what needs to be triggered in this context
   */
  public trigger (name : string) : this {
    if (!this.birbables.has(name)) {
      return this;
    }

    this.unmount(this.birbables.get(name));
    this.emitter.emit(name, this);
    return this;
  }

  private unmount (birbable : Birbable) : void {
    if (birbable.belongsToGroup) { return this.clearGroup(birbable.group); }

    if (birbable.lifetime === 'SINGLE') { this.birbables.delete(birbable.constructor.name); }
  }

  private clearGroup (group : symbol) : void {
    const groupEntities : Birbable[] = [];
    this.birbables.forEach((birbable) => {
      if (birbable.group === group) { groupEntities.push(birbable); }
    });

    groupEntities.forEach((groupedBirbable) => {
      this.birbables.delete(groupedBirbable.constructor.name);
    });
  }

  /**
   * Signs a Birbable in your context. Only signed Birbables can be triggered
   * @param birbable
   */
  public sign (birbable : Birbable) : this {
    this.birbables.set(birbable.constructor.name, birbable);
    this._addToListener(birbable);

    return this;
  }

  /**
   * Usigns a Birbable from the context.
   * @param birbable Any Birbable that was signed before in this context
   */
  public unsign (birbable : Birbable) : this {
    const foundBirbable = this.birbables.get(birbable.constructor.name);

    if (foundBirbable !== undefined) {
      this.birbables.delete(birbable.constructor.name);
      this.emitter.removeAllListeners(birbable.constructor.name);
    }

    return this;
  }

  private _addToListener (birbable : Birbable) : void {
    if (birbable.belongsToGroup) {
      this.emitter.once(birbable.constructor.name, birbable.execute);
      return;
    }

    const method = birbable.lifetime === 'DURABLE' ? 'on' : 'once';
    this.emitter[method](birbable.constructor.name, birbable.execute);
  }
}
