import { Birbable, BirbsRunnable, Identifier } from './types';
import { Context } from './context';

export class BirbableGroup extends BirbsRunnable {
  public readonly __type = 'BIRBABLE_GROUP';
  public readonly birbableList : Birbable[] = [];

  public constructor (identifier : Identifier) {
    super({ identifier, lifetime: 'DURABLE' });
  }

  async execute<T extends Context>(context : T, identifier : Identifier) : Promise<void> {
    let foundIndex : number;
    const birbable = this.birbableList.find((birbable, index) => {
      if (birbable.identifier === identifier) {
        foundIndex = index;
        return true;
      };
    });

    this.birbableList.splice(foundIndex, 1);
    await birbable.execute(context, identifier);

    this.birbableList.forEach((remainingBirbable) => {
      context.unsign(remainingBirbable);
    });

    return;
  }
};
