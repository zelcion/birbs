import { BehaviourBuilder } from './behaviour-builder';
import { BehaviourType } from '../utils/types';
import { Context } from '../context/context';

export class Behaviour extends BehaviourBuilder{
  public setContext(context : Context) : void {
    this._context = context;
  }

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
      executionCompletion.push(action(this, this._context));
    });

    await Promise.all(executionCompletion);
    return;
  }

};
