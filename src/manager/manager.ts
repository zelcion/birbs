import { Behaviour } from '../behaviour/behaviour';
import { Container } from '../container/container';
import { getIdentifierOf } from '../utils/utils';

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

  public fetchContainer(containerIdentifier : symbol) : Container {
    return this.containers.get(containerIdentifier);
  }

  public broadcast(behaviour : Behaviour | symbol, container ?: Container | symbol) : EventManager {
    const chosenContainer = (container !== undefined)?
      this.containers.get(getIdentifierOf(container)) : undefined;

    if (chosenContainer === undefined) {
      this.containers.forEach(
        (context) => context.publish(behaviour)
      );

      return this;
    }

    chosenContainer.publish(behaviour);
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

};
