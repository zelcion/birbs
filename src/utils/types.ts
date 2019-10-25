import { Behaviour } from '../behaviour/behaviour';
import { Context } from '../context/context';

export type Action = (event : Behaviour, context : Context) => void | Promise<void>;

export type TeardownStrategies = 'all' | 'none' | 'once';

export type BehaviourType = 'once' | 'always';

export type BehaviourSignature = { identifier : symbol; type : BehaviourType };

export type VoidableBehaviourModifier = (behaviour : Behaviour) => void;

export type VoidableContainerModifier = (container : Context) => void;

export type Identifiable = Behaviour | Context;
