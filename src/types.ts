import { Behaviour } from './behaviour/behaviour';
import { Container } from './container';

export type Action = (event : Behaviour) => void | Promise<void>;

export type TeardownStrategies = 'all' | 'none' | 'once';

export type BehaviourType = 'once' | 'always';

export type BehaviourSignature = { identifier : symbol; type : BehaviourType };

export type VoidableBehaviourModifier = (behaviour : Behaviour) => void;

export type Identifiable = Behaviour | Container;
