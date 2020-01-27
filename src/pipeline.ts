import { Birbable, BirbsOption, BirbsRunnable } from './types';
import { Context } from './context';
import { Procedure } from './procedure';

/**
 * Birbable entity used to run a sequence of Procedures
 * @abstract
 */
export abstract class Pipeline extends BirbsRunnable {
  /**
   * A property used to assert the type of the Birbable
   * @readonly
   */
  public readonly __type = 'PIPELINE';

  private readonly steps : Map<string, Procedure> = new Map();
  private readonly onFinish ?: CallableFunction;
  private readonly onFail ?: CallableFunction;

  /**
   * Adds a step to the pipeline
   * @param procedure The next procedure to execute
   */
  public addStep(procedure : Procedure) : Pipeline {
    this.steps.set(procedure.constructor.name, procedure);

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

    this.addStep = this.addStep.bind(this);
    this.execute = this.execute.bind(this);
    this.runPipeline = this.runPipeline.bind(this);
    this.catchFail = this.catchFail.bind(this);
  }

  private catchFail () : (error : Error) => void {
    return ((error) : void => {
      if (this.onFail !== undefined) { this.onFail(error); return; }

      throw error;
    });
  }

  private async runPipeline(executionList : Birbable[], context : Context, descriptable?) : Promise<void> {

    for (const birbable of executionList) {
      await birbable.execute(context, descriptable).catch(this.catchFail());
    }

    if (this.onFinish !== undefined) this.onFinish(context);
    return;
  };

  /**
   * When working with Pipeline's execute method, prefer to pass
   * the context type that you are working with so it is possible to
   * assert the type that you're working with
   */
  public async execute (context : Context, descriptable?) : Promise<void> {
    const executionList : Birbable[] = [];
    this.steps.forEach((birbable) => {
      executionList.push(birbable);
    });

    await this.runPipeline(executionList, context, descriptable);
  }
}
