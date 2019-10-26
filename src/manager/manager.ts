import { Context } from '../context/context';
import { getIdentifierOf } from '../utils/utils';
import { Procedure } from '../procedure/procedure';

export class EventManager {
  private containers : Map<symbol, Context> = new Map();
  // TODO: Add registry of calls, saved by timestamp, context, and procedure
  // Also make methods to retrieve them

  // Test making this a singleton in `process.eventManager`

  public addContainer(container : Context) : EventManager {
    this.containers.set(container.identifier, container);
    return this;
  }

  public removeContainer(container : Context | symbol) : EventManager {
    this.containers.delete(getIdentifierOf(container));
    return this;
  }

  public fetchContainer(containerIdentifier : symbol) : Context {
    return this.containers.get(containerIdentifier);
  }

  public broadcast(procedure : Procedure | symbol, container ?: Context | symbol) : EventManager {
    const chosenContainer = (container !== undefined)?
      this.containers.get(getIdentifierOf(container)) : undefined;

    if (chosenContainer === undefined) {
      this.containers.forEach(
        (context) => context.publish(procedure)
      );

      return this;
    }

    chosenContainer.publish(procedure);
    return this;
  }

  public listen(procedure : Procedure, container : Context | symbol) : EventManager {
    this.containers.get(getIdentifierOf(container)).sign(procedure);
    return this;
  }

  public removeListener(procedure : Procedure, container : Context | symbol) : EventManager {
    this.containers.get(getIdentifierOf(container)).resign(procedure);
    return this;
  }

};
