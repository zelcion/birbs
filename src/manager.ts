import { Behaviour } from './behaviour';
import { Container } from './container';
import { getIdentifierOf } from './utils';

export class EventManager {
  private containers : Map<symbol, Container> = new Map();

  public addContainer(container : Container) : EventManager {
    this.containers.set(container.identifier, container);
    return this;
  }

  public removeContainer(container : Container | symbol) : EventManager {
    this.containers.delete(getIdentifierOf(container));
    return this;
  }

  public broadcast(behaviour : Behaviour | symbol, container : Container | symbol) : EventManager {
    this.containers.get(getIdentifierOf(container)).publish(behaviour);
    return this;
  }

  public listen(behaviour : Behaviour, container : Container | symbol) : EventManager {
    this.containers.get(getIdentifierOf(container)).sign(behaviour);
    return this;
  }

  public removeListener(behaviour : Behaviour, container : Container | symbol) : EventManager {
    this.containers.get(getIdentifierOf(container)).resign(behaviour);
    return this;
  }

  // Add Actions to behaviours [By symbols or itself] [optional argument: to a single container or all references]
};
