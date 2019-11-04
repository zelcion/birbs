import { EventRegistryQuery, Identifiable, VoidableContainerModifier, VoidableProcedureModifier } from './types';
import { Context } from '../context/context';
import { Procedure } from '../procedure/procedure';

export function throwNoEffects (procedure : Procedure) : void {
  if (procedure.effects.length === 0) {
    throw TypeError('Error while trying to build or execute procedure: No Effects registered');
  }
};

export function throwNoIdentifier (identifiable : Identifiable) : void {
  if (identifiable.identifier === undefined) {
    throw TypeError('Error while trying to build instance: No identifier was set.');
  }
};

export function throwNoFlushingStrategy (context : Context) : void {
  if (context.flushingStrategy === undefined) {
    throw TypeError('The context does not have a set Strategy.');
  }
};

export function throwIfNoProcedureFound (procedure ?: Procedure) : void {
  if (procedure === undefined) {
    throw TypeError('The context does not have the requested procedure.');
  }
};

export function throwNoProceduresRegistered (map : Map<symbol, Procedure>) : void {
  if (map.size === 0) {
    throw TypeError('The context does not have any registered Procedures');
  }
};

export function throwInvalidParameter <T extends keyof EventRegistryQuery> (
  query : EventRegistryQuery, parameter : T
) : void {
  if (query[parameter] === undefined) {
    throw TypeError(`Not able to execute Query: The parameter ${parameter} is undefined for this query`);
  }
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function throwWrongType (argument : any, types : string[]) : void {
  let matchAttempts = types.length;
  types.forEach((type) => {
    if (typeof argument !== type) matchAttempts -= 1;
  });

  if (matchAttempts === 0) {
    throw TypeError(
      `"${argument}" is of an invalid type! Expected a "${types.join('", or "')}" but got "${typeof argument}"`
    );
  }
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function throwWrongInstantiableClassInstance <T extends object>(argument : any, type : new() => T) : void {
  if (!(argument instanceof type)) {
    throw TypeError(`"${argument}" is of an invalid Class! Expected a "${type}" but got "${typeof argument}"`);
  }
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function throwMethodNotPresent (instance : any, methodName : string, className : string) : void {
  if (typeof instance[methodName] !== 'function' ) {
    throw TypeError(
      `The object Passed is not a valid Instance of ${className}! It is missing the method ${methodName}!`
    );
  }
}

export function throwTargetAlreadyBuilt (
  modifierList : VoidableContainerModifier[] | VoidableProcedureModifier[] | null
) : void {
  if (modifierList === null) {
    throw TypeError('Cannot build or add a modifier to a target that has been already built!');
  }
}
