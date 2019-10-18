import { BehaviourBuilder } from './behaviour-builder';
import { BehaviourType } from '../utils/types';

export class Behaviour extends BehaviourBuilder{
  public get identifier() : symbol {
    return this._identifier;
  }

  public get type() : BehaviourType {
    return this._type;
  }

  public constructor () {
    super();
    this.Act = this.Act.bind(this);
  }

  public async Act() : Promise<void> {
    const executionCompletion = [];
    this._actions.forEach((action) => {
      executionCompletion.push(action(this));
    });

    await Promise.all(executionCompletion);
    return;
  }

};
