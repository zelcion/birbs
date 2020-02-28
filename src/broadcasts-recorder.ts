import { BroadcastsRecorderEvents } from './types';
import { Context } from './context';
import { EventEmitter } from 'events';

interface Broadcast {
  procedureName : string;
  contextState : Context & any; // eslint-disable-line @typescript-eslint/no-explicit-any
  data ?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Is the controller that can be plugged into a EventManager to store/dump/read the broadcast history
 * of the said EventManager.
 */
export class BroadcastsRecorder {
  private readonly __eventEmitter = new EventEmitter();

  /**
   * @private The list of broadcasts that still haven't been dumped
   */
  private __undumpedBroadcasts : Map<number, Broadcast> = new Map();

  /**
   * The total amount of stored undumped broadcasts
   */
  public get size () : number {
    return this.__undumpedBroadcasts.size;
  }

  /**
   * The index of the last read message
   */
  public readOffset = 0;

  /**
   * Reads an entry from the records
   * Beware that unbound methods or getters/setters are not saved on the records.
   * @param index the index of the record to be read
   */
  public read(index ?: number) : Broadcast | undefined {
    const inputReadIndex = (index ?? this.nextOffset);
    const selectedReadIndex = inputReadIndex >= this.size
      ? this.size
      : inputReadIndex;
    const result = this.__undumpedBroadcasts.get(selectedReadIndex);

    if (index === undefined && result !== undefined && inputReadIndex <= this.size) {
      this.readOffset += 1;
    }

    this.__eventEmitter.emit(BroadcastsRecorderEvents.READ, [result]);
    return result;
  }

  /**
   * The next offset that the method .read() will use
   */
  public get nextOffset() : number {
    return this.readOffset + 1;
  }

  /**
   * Writes the state to the undumped broadcast list
   * @param procedureName
   * @param contextState
   * @param data Optional
   * @WARNING Writing directly to this will make this instance record a change
   * that did not happen!
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeState(procedureName : string, contextState : Context, data ?: any) : void {
    const newEntry = {
      contextState: Object.assign({}, contextState),
      data,
      procedureName,
    };

    this.__undumpedBroadcasts.set(this.size + 1, newEntry);
    this.__eventEmitter.emit(BroadcastsRecorderEvents.WRITE, [newEntry]);

    return;
  }

  /**
   * Reads the list of recorded broadcasts and clears it.
   * Beware that unbound methods or getters/setters are not saved on the records.
   */
  public dump() : Broadcast[] {
    const result : Broadcast[] = [];

    this.__undumpedBroadcasts.forEach((value) => {
      result.push(value);
    });

    this.__undumpedBroadcasts.clear();
    this.readOffset = 0;

    this.__eventEmitter.emit(BroadcastsRecorderEvents.DUMP, result);
    return result;
  }

  /**
   * Listens to an event that is emitted by this BroadcastsRecorder instance
   * @param event The event to listen to.
   * @param callback The callback to be executed when the event is emitted.
   */
  public on(event : BroadcastsRecorderEvents, callback : (broadcasts : Broadcast[]) => void) : this {
    this.__eventEmitter.on(event, callback);

    return this;
  }

  /**
   * Removes a listener from this BroadcastsRecorder instance
   * @param event The event to remove listener from.
   * @param callback The listener callback.
   */
  public off(event : BroadcastsRecorderEvents, callback : (broadcasts : Broadcast[]) => void) : this {
    this.__eventEmitter.removeListener(event, callback);

    return this;
  }
}
