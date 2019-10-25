import { Context } from '../context/context';
import { ProcedureBuilder } from './procedure-builder';
import { ProcedureType } from '../utils/types';

export class Procedure extends ProcedureBuilder{
  public setContext(context : Context) : void {
    this._context = context;
  }

  public get identifier() : symbol {
    return this._identifier;
  }

  public get type() : ProcedureType {
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
