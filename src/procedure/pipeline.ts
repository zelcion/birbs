import { Context } from '../context/context';
import { Effect } from '../utils/types';
import { Procedure } from './procedure';

export class Pipeline<T extends Procedure = Procedure, Y extends Context = Context> {
  private steps : Map<number, Effect<T, Y>> = new Map();
  private context : Y;
  private currentStep = 0;
  private onFinish : CallableFunction = () => {};
  private onFail : CallableFunction = (error : Error) => { throw error; };

  public step(effect : Effect<T, Y>) : Pipeline<T, Y> {
    this.steps.set(this.steps.size, effect);

    return this;
  };

  public constructor (onFinish ?: CallableFunction, onFail ?: CallableFunction) {
    this.onFinish = onFinish;
    this.onFail = onFail;
  }

  private async runStep(procedure : T) : Promise<void> {
    if (this.steps.get(this.currentStep) === undefined) { this.onFinish(); return; }

    const stepExecution = this.steps.get(this.currentStep).execution.bind(this.context);

    try {
      await stepExecution(procedure);
    } catch (error) {
      this.onFail(error);
    }

    this.currentStep += 1;
    this.runStep(procedure);
  };

  public executePipeline(context : Y, procedure : T) : void {
    this.context = context;

    this.runStep(procedure);
  }
}
