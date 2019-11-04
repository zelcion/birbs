import { EventRegistry } from './event-registry';
import { EventRegistryQuery } from '../utils/types';
import { throwInvalidParameter } from '../utils/error-handler';

export class EventHistory { // Next >> Implement saving history of events
  private _eventRegistry : EventRegistry[] = [];

  public getEventHistory<T extends keyof EventRegistryQuery>(query ?: EventRegistryQuery) : EventRegistry[] {
    let result = this._eventRegistry;

    if (query === undefined) {
      return result;
    }

    for (const presentParameter in query) {
      const param = presentParameter as T;
      result = this.queryFor(param, query, result);
    }

    return result;
  };

  private queryFor<T extends keyof EventRegistryQuery>(
    parameter : T,
    query : EventRegistryQuery,
    intermediateResult : EventRegistry[]
  ) : EventRegistry[] {
    throwInvalidParameter(query, parameter);

    let result = intermediateResult;

    if (parameter === 'maximumDate') {
      result = result.filter((registry) => {
        return registry.occurenceDate < query.maximumDate;
      });

      return result;
    }

    if (parameter === 'minimumDate') {
      result = result.filter((registry) => {
        return registry.occurenceDate > query.minimumDate;
      });

      return result;
    }

    result = result.filter((registry) => {
      return registry.occurenceDate === query[parameter];
    });

    return result;
  }
};
