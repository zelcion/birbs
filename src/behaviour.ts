import { Action, BehaviourType } from './types';
import { setSymbol } from './utils';

export class Behaviour {
  public readonly identifier : symbol;
  public type : BehaviourType;
  public actions : Map<symbol, Action> = new Map();

  public constructor (options ?: {identifier : symbol | string; type : BehaviourType}) {
    this.Act = this.Act.bind(this);

    if (options === undefined) return;
    this.identifier = setSymbol(options.identifier);
    this.type = options.type;
  }

  public bindAction(action : Action, name : symbol | string) : Behaviour {
    const actionKey : symbol = setSymbol(name);

    this.actions.set(actionKey, action);

    return this;
  }

  public async Act() : Promise<void> {
    const executionCompletion = [];
    this.actions.forEach((action) => {
      executionCompletion.push(action(this));
    });

    await Promise.all(executionCompletion);
    return;
  }

};
