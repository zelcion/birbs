import { Context } from './context';

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

  public read(index ?: number) : Broadcast | undefined {
    const result = this.__undumpedBroadcasts.get(index ?? this.nextOffset);

    if (index === undefined && result !== undefined) {
      this.readOffset += 1;
    }

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

    return;
  }

  /**
   * Reads the list of recorded broadcasts and clears it
   */
  public dump() : Broadcast[] {
    const result : Broadcast[] = [];

    this.__undumpedBroadcasts.forEach((value) => {
      result.push(value);
    });

    this.__undumpedBroadcasts.clear();
    this.readOffset = 0;

    return result;
  }
}
