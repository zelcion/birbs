import { Birbable, Identifiable, Identifier } from './types';
import { EventEmitter } from 'events';

/**
 * Context defines a group of information available to a Procedure when
 * it gets executed. A context may have any Bibrbable instance signed on it.
 */
export class Context extends Identifiable {
  public readonly emitter : EventEmitter = new EventEmitter();
  public readonly birbables : Map<symbol, Birbable> = new Map();

  /**
   * Executes an Executable entity
   * @param identifier Identifier of what needs to be triggered in this context
   */
  public trigger (identifier : symbol) : this {
    if (!this.birbables.has(identifier)) {
      return this;
    }

    this.unmount(this.birbables.get(identifier));
    this.emitter.emit(identifier, this);
    return this;
  }

  private unmount (birbable : Birbable) : void {
    if (birbable.belongsToGroup) { return this.clearGroup(birbable.__group); }

    if (birbable.__lifetime === 'SINGLE') { this.birbables.delete(birbable.identifier); }
  }

  private clearGroup (group : Identifier) : void {
    const groupEntities : Birbable[] = [];
    this.birbables.forEach((birbable) => {
      if (birbable.__group === group) { groupEntities.push(birbable); }
    });

    groupEntities.forEach((groupedBirbable) => {
      this.birbables.delete(groupedBirbable.identifier);
    });
  }

  /**
   * Signs a Birbable in your context. Only signed Birbables can be triggered
   * @param birbable
   */
  public sign (birbable : Birbable) : this {
    this.birbables.set(birbable.identifier, birbable);
    this._addToListener(birbable);

    return this;
  }

  /**
   * Usigns a Birbable from the context.
   * @param birbable Any Birbable that was signed before in this context
   */
  public unsign (birbable : Birbable) : this {
    const foundBirbable = this.birbables.get(birbable.identifier);

    if (foundBirbable !== undefined) {
      this.birbables.delete(birbable.identifier);
      this.emitter.removeAllListeners(birbable.identifier);
    }

    return this;
  }

  private _addToListener (birbable : Birbable) : void {
    if (birbable.belongsToGroup) {
      this.emitter.once(birbable.identifier, birbable.execute);
      return;
    }

    const method = birbable.__lifetime === 'DURABLE' ? 'on' : 'once';
    this.emitter[method](birbable.identifier, birbable.execute);
  }
}
