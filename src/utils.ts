import { BehaviourType, Identifiable } from './types';

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

export const throwTypeInvalid = (type : BehaviourType) : void => {
  if(type !== 'once' && type !== 'always') {
    throw new Error('Unrecognized type in builder! Type must be either "once" or "always"!');
  }
};
