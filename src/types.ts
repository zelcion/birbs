import { Behaviour } from './behaviour';
import { Container } from './container';

export type Action = (event : Behaviour) => void | Promise<void>;

export type TeardownStrategies = 'all' | 'none' | 'once';

export type BehaviourType = 'once' | 'always';

export type BehaviourSignature = { identifier : symbol; type : BehaviourType };

export type Identifiable = Behaviour | Container;
