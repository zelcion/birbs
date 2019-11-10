import { Effect, Execution, FlushingStrategies, Identifiable, ProcedureLifecycle } from './types';
import { Procedure } from '../procedure/procedure';

export const setSymbol = (entry : symbol | string) : symbol => {
  let result : symbol;
  if (typeof entry === 'string') {
    result = Symbol(entry);
    return result;
  }

  result = entry;
  return result;
};

export const getStringFromSymbol = (entry : symbol) : string => {
  return Symbol.keyFor(entry);
};

export const getIdentifierOf = (identity : Identifiable | symbol) : symbol => {
  if (typeof identity === 'symbol') return identity;

  return identity.identifier;
};

export const throwInvalidProcedureLifecycle = (type : ProcedureLifecycle) : void => {
  if(type !== 'ephemeral' && type !== 'permanent') {
    throw TypeError('Unrecognized type in builder! Type must be either "ephemeral" or "permanent"!');
  }
};

export const throwStrategyInvalid = (type : FlushingStrategies) : void => {
  if(type !== 'each-publish' && type !== 'no-flush') {
    throw TypeError('Unrecognized type in builder! Type must be "each-publish", or "no-flush"!');
  }
};

export const toNewEffect = <T extends Procedure>(execution : Execution<T>) : Effect => {
  if (typeof execution !== 'function') {
    throw TypeError('The argument is not a function.');
  }

  class StandardEffect implements Effect {
    private _boundExecution : Execution<T>;

    constructor (exec : Execution<T>) {
      this.execution = exec;
    }
    execution(event : T) : void {
      console.log(event, 'you probably forgot to pass in a function here.');
      throw TypeError('missing function on the argument');
    }
  }

  const result = new StandardEffect(execution);

  return result;
};
