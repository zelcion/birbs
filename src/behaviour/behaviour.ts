import { BehaviourBuilder } from './behaviour-builder';

export class Behaviour extends BehaviourBuilder{
  public get identifier() : symbol {
    return this._identifier;
  }

  public constructor () {
    super();
    this.Act = this.Act.bind(this);
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
