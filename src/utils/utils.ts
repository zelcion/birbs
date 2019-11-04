import { FlushingStrategies, Identifiable, ProcedureLifecycle } from './types';

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
