import { Context } from '../context/context';
import { EventRegistry } from './event-registry';
import { EventRegistryQuery } from '../utils/types';
import { getIdentifierOf } from '../utils/utils';
import { Procedure } from '../procedure/procedure';

export class EventManager {
  private _contexts : Map<symbol, Context> = new Map();
  private _eventRegistry : EventRegistry[] = [];

  public getEventHistory(query ?: EventRegistryQuery) : EventRegistry[] {
    let result = this._eventRegistry;

    if (query === undefined) {
      return result;
    }

    if (query.maximumDate !== undefined) {
      result = result.filter((registry) => {
        return registry.occurenceDate < query.maximumDate;
      });
    }

    if (query.minimumDate !== undefined) {
      result = result.filter((registry) => {
        return registry.occurenceDate > query.minimumDate;
      });
    }

    if (query.contextId !== undefined) {
      result = result.filter((registry) => {
        return registry.contextId === query.contextId;
      });
    }

    if (query.procedureId !== undefined) {
      result = result.filter((registry) => {
        return registry.procedureId === query.procedureId;
      });
    }

    return result;
  };

  // Test making this a singleton in `process.eventManager`

  public addContainer(context : Context) : EventManager {
    this._contexts.set(context.identifier, context);
    return this;
  }

  public removeContainer(context : Context | symbol) : EventManager {
    this._contexts.delete(getIdentifierOf(context));
    return this;
  }

  public fetchContainer(contextIdentifier : symbol) : Context {
    return this._contexts.get(contextIdentifier);
  }

  public broadcast(procedure : Procedure | symbol, context ?: Context | symbol) : EventManager {
    const chosenContainer = (context !== undefined)?
      this._contexts.get(getIdentifierOf(context)) : undefined;

    if (chosenContainer === undefined) {
      this._contexts.forEach(
        (selectedContext) => {
          selectedContext.publish(procedure);
          this._eventRegistry.push(new EventRegistry(
            getIdentifierOf(procedure),
            getIdentifierOf(selectedContext)
          ));
        }
      );

      return this;
    }

    this._eventRegistry.push(new EventRegistry(
      getIdentifierOf(procedure),
      getIdentifierOf(context)
    ));
    chosenContainer.publish(procedure);
    return this;
  }

  public listen(procedure : Procedure, context : Context | symbol) : EventManager {
    this._contexts.get(getIdentifierOf(context)).sign(procedure);
    return this;
  }

  public removeListener(procedure : Procedure, context : Context | symbol) : EventManager {
    this._contexts.get(getIdentifierOf(context)).resign(procedure);
    return this;
  }

};
