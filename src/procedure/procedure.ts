import { Effect, ProcedureLifecycle } from '../utils/types';
import { Context } from '../context/context';
import { ProcedureBuilder } from './procedure-builder';

export class Procedure extends ProcedureBuilder{
  public get identifier() : symbol {
    return this._identifier;
  }

  public get lifecycle() : ProcedureLifecycle {
    return this._lifecycle;
  }

  public constructor () {
    super();
    this.Run = this.Run.bind(this);
  }

  public get effects () : Effect[] {
    return this._effects;
  }

  public async Run(context : Context) : Promise<void> {
    if (context === undefined) throw TypeError('This method needs to be called from a context.');

    const executionCompletion = [];
    this._effects.forEach((effect) => {
      const exec = effect.execution.bind(context);
      executionCompletion.push(exec(this));
    });

    await Promise.all(executionCompletion);
    return;
  }

};
