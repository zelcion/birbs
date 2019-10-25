import { Context } from '../context/context';
import { Procedure } from '../procedure/procedure';

export type Action = (event : Procedure, context : Context) => void | Promise<void>;

export type TeardownStrategies = 'all' | 'none' | 'once';

export type ProcedureType = 'once' | 'always';

export type ProcedureSignature = { identifier : symbol; type : ProcedureType };

export type VoidableProcedureModifier = (Procedure : Procedure) => void;

export type VoidableContainerModifier = (container : Context) => void;

export type Identifiable = Procedure | Context;

// export type EventRegistry = {  }
