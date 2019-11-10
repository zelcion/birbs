import { Context } from '../context/context';
import { Procedure } from '../procedure/procedure';

export abstract class Effect {
  abstract execution(event : Procedure) : void | Promise<void>;
};

export type Execution<T> = (procedure : T) => void;

export type FlushingStrategies = 'no-flush' | 'each-publish';

export type ProcedureLifecycle = 'ephemeral' | 'permanent'; // TODO -> Pick better name than ephemeral

export type ProcedureSignature = { identifier : symbol; lifecycle : ProcedureLifecycle };

export type VoidableProcedureModifier = (Procedure : Procedure) => void;

export type VoidableContainerModifier = (container : Context) => void;

export type Identifiable = Procedure | Context;

export type EventRegistryQuery = {
  minimumDate ?: Date;
  maximumDate ?: Date;
  procedureId ?: symbol;
  contextId ?: symbol;
};

export type ContextOptions = {
  identifier ?: symbol | string;
  strategy ?: FlushingStrategies;
};

export type ProcedureOptions = {
  identifier ?: symbol | string;
  lifecycle ?: ProcedureLifecycle;
  effects ?: Effect[];
};
