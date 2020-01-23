import { Birbable, Identifiable } from './types';
import { EventEmitter } from 'events';

/**
 * Context defines a group of information available to a Procedure when
 * it gets executed. A context may have any Bibrbable instance signed on it.
 */
export class Context extends Identifiable {
  private readonly emitter : EventEmitter = new EventEmitter();
  private readonly birbables : Map<symbol, Birbable> = new Map();

  /**
   * Executes an Executable entity
   * @param identifier Identifier of what needs to be triggered in this context
   */
  public trigger (identifier : symbol) : this {
    if (!this.birbables.has(identifier)) {
      return this;
    }

    this.emitter.emit(identifier, this, identifier);

    this.unmount(this.birbables.get(identifier));
    return this;
  }

  private unmount (birbable : Birbable) : void {
    if (birbable.lifetime === 'SINGLE') { this.birbables.delete(birbable.identifier); }
  }

  /**
   * Signs a Birbable in your context. Only signed Birbables can be triggered
   * @param birbable
   */
  public sign (birbable : Birbable) : this {
    if (birbable.__type === 'BIRBABLE_GROUP') {
      birbable.birbableList.forEach((birbsExecutable) => {
        this.emitter.once(birbsExecutable.identifier, birbable.execute);
      });

      this.birbables.set(birbable.identifier, birbable);
      return this;
    }

    this.birbables.set(birbable.identifier, birbable);

    this._addToListener(birbable);

    return this;
  }

  public unsign (birbable : Birbable) : this {
    const foundBirbable = this.birbables.get(birbable.identifier);

    if (foundBirbable !== undefined) this.birbables.delete(birbable.identifier);
    this.emitter.removeAllListeners(birbable.identifier);

    return this;
  }

  private _addToListener (birbable : Birbable) : void {
    const method = birbable.lifetime === 'DURABLE' ? 'on' : 'once';
    this.emitter[method](birbable.identifier, birbable.execute);
  }
}
