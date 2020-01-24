import { Birbable, BirbsRunnable, Identifier } from './types';
import { Context } from './context';

export class BirbableGroup extends BirbsRunnable {
  public readonly __type = 'BIRBABLE_GROUP';
  public readonly birbableList : Map<symbol, Birbable> = new Map();

  public constructor (identifier : Identifier) {
    super({ identifier, lifetime: 'DURABLE' });

    this.execute = this.execute.bind(this);
  }

  public addBirbable(birbable : Birbable) : this {
    this.birbableList.set(birbable.identifier, birbable);

    return this;
  }

  async execute<T extends Context>(context : T, identifier : symbol) : Promise<void> {
    const selectedBirbable = this.birbableList.get(identifier);
    selectedBirbable.execute(context, identifier);

    this.birbableList.forEach((birbableInGroup) => {
      context.unsign(birbableInGroup);
    });
    this.birbableList.clear();

    return;
  }
};
