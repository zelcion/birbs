import { Context } from '../context/context';
import { ProcedureBuilder } from './procedure-builder';
import { ProcedureLifecycle } from '../utils/types';

export class Procedure extends ProcedureBuilder{
  public get identifier() : symbol {
    return this._identifier;
  }

  public get lifecycle() : ProcedureLifecycle {
    return this._lifecycle;
  }

  public constructor () {
    super();
    this.Act = this.Act.bind(this);
  }

  public async Act(context : Context) : Promise<void> {
    const executionCompletion = [];
    this._effects.forEach((effect) => {
      const exec = effect.execution.bind(context);
      executionCompletion.push(exec(this));
    });

    await Promise.all(executionCompletion);
    return;
  }

};
