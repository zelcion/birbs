import { BirbsOption, BirbsRunnable, Identifier } from './types';
import { Context } from './context';
import { Procedure } from './procedure';

/**
 * Birbable entity used to run a sequence of Procedures
 */
export class Pipeline extends BirbsRunnable {
  public readonly __type = 'PIPELINE';
  private context;

  private steps : Map<number, Procedure> = new Map();
  private currentStep = 0;
  private readonly onFinish ?: CallableFunction;
  private readonly onFail ?: CallableFunction;

  /**
   * Adds a step to the pipeline
   * @param procedure The next procedure to execute
   */
  public addStep(procedure : Procedure) : Pipeline {
    this.steps.set(this.steps.size, procedure);

    return this;
  };

  /**
   * @param options Options to build the new Pipeline
   * @param onFinish Callback executed when the pipeline finishes. Recieves the context as an argument
   * @param onFail Callback executed when a step fails
   */
  public constructor (
    options : BirbsOption,
    onFinish ?: CallableFunction,
    onFail ?: (error : Error) => void
  ) {
    super(options);
    this.onFinish = onFinish;
    this.onFail = onFail;

    this.execute = this.execute.bind(this);
    this.runStep = this.runStep.bind(this);
  }

  private async runStep(identifier : Identifier) : Promise<void> {
    if (this.steps.get(this.currentStep) === undefined) {
      if (this.onFinish !== undefined) this.onFinish(this.context);
      return;
    }

    const stepExecution = this.steps.get(this.currentStep);

    try {
      await stepExecution.execute(this.context, identifier);
    } catch (error) {
      if (this.onFail !== undefined) { this.onFail(error); return; }

      throw error;
    }

    this.currentStep += 1;
    this.runStep(identifier);
  };

  /**
   * When working with Pipeline's execute method, prefer to pass
   * the context type that you are working with so it is possible to
   * assert the type that you're working with
   */
  public async execute (context : Context, identifier : Identifier) : Promise<void> {
    this.context = context;

    await this.runStep(identifier);
  }
}
