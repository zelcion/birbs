import { describe, it } from 'mocha';
import { BroadcastsRecorder } from '../src/broadcasts-recorder';
import { BroadcastsRecorderEvents } from '../src/types';
import { Context } from '../src/context';
import { EventManager } from '../src/manager';
import { expect } from 'chai';
import { Procedure } from '../src/procedure';

class TestContext extends Context {
  private property = 'I am a test Context';
  public visibleProperty =  'Hello World';

  constructor () {
    super('identifier');

    this.privatePropertyWasModified = this.privatePropertyWasModified.bind(this);
  }

  public setPrivateProperty (text : string) : void {
    this.property = text;
  }

  public privatePropertyWasModified () : boolean {
    return this.property !== 'I am a test Context';
  }
};

class ChangeInternalProperty extends Procedure {
  public async execute(context : TestContext, descriptable ?: string) : Promise<void> {
    context.setPrivateProperty(descriptable);
  };
};

class ChangeExternalProperty extends Procedure {
  public async execute(context : TestContext, descriptable ?: string) : Promise<void> {
    context.visibleProperty = descriptable;
  }
}

describe('Broadcast Recorder', () => {
  let testContext : TestContext;
  let eventManager : EventManager;
  let recorder : BroadcastsRecorder;

  beforeEach(() => {
    testContext = new TestContext();
    recorder = new BroadcastsRecorder();
    eventManager = new EventManager(recorder);

    eventManager.addContext(testContext)
      .addBirbable(new ChangeExternalProperty({ lifetime: 'DURABLE' }), 'identifier')
      .addBirbable(new ChangeInternalProperty({ lifetime: 'DURABLE' }), 'identifier');
  });

  it('Reading progresstion', () => {
    eventManager
      .broadcast('ChangeExternalProperty', 'identifier', 'thisText')
      .broadcast('ChangeInternalProperty', 'identifier', 'thatText')
      .broadcast('ChangeExternalProperty', 'identifier', 'thoseTexts');

    expect(recorder.readOffset).to.be.equal(0);
    expect(recorder.read()).to.not.be.empty;
    expect(recorder.readOffset).to.be.equal(1);
    expect(recorder.read()).to.not.be.empty;
    expect(recorder.readOffset).to.be.equal(2);
    expect(recorder.read()).to.not.be.empty;
    expect(recorder.readOffset).to.be.equal(3);
    expect(recorder.read()).to.not.be.empty;
    expect(recorder.readOffset).to.be.equal(3);
    expect(recorder.read()).to.not.be.empty;
    expect(recorder.readOffset).to.be.equal(3);
  });

  it('Selected Reading', () => {
    eventManager
      .broadcast('ChangeExternalProperty', 'identifier', 'thisText')
      .broadcast('ChangeInternalProperty', 'identifier', 'thatText')
      .broadcast('ChangeExternalProperty', 'identifier', 'thoseTexts');

    expect(recorder.readOffset).to.be.equal(0);
    expect(recorder.read(1)).to.not.be.empty;
    expect(recorder.read(1).data).to.be.equal('thisText');
    expect(recorder.readOffset).to.be.equal(0);
  });

  it('Dumping and Cleaning', () => {
    eventManager
      .broadcast('ChangeExternalProperty', 'identifier', 'thisText')
      .broadcast('ChangeInternalProperty', 'identifier', 'thatText')
      .broadcast('ChangeExternalProperty', 'identifier', 'thoseTexts');

    expect(recorder.size).to.be.equal(3);
    expect(recorder.dump().length).to.be.equal(3);
    expect(recorder.size).to.be.equal(0);
    expect(recorder.dump().length).to.be.equal(0);
  });

  it('Read Event', (done) => {
    recorder.on(BroadcastsRecorderEvents.READ, (readResult) => {
      const context = readResult[0].contextState as TestContext;
      expect(context.privatePropertyWasModified()).to.be.true;
      done();
    });

    eventManager.broadcast('ChangeInternalProperty', 'identifier', 'thoseTexts');
    recorder.read();
  });

  it('Write Event', (done) => {
    recorder.on(BroadcastsRecorderEvents.WRITE, (writeResult) => {
      const context = writeResult[0].contextState as TestContext;
      expect(context.privatePropertyWasModified()).to.be.true;
      done();
    });

    eventManager.broadcast('ChangeInternalProperty', 'identifier', 'sampleText');
  });

  it('Dump Event', (done) => {
    recorder.on(BroadcastsRecorderEvents.DUMP, (dumpResult) => {
      expect(dumpResult.length).to.be.equal(3);
      done();
    });

    eventManager
      .broadcast('ChangeExternalProperty', 'identifier', 'thisText')
      .broadcast('ChangeInternalProperty', 'identifier', 'thatText')
      .broadcast('ChangeExternalProperty', 'identifier', 'thoseTexts');

    recorder.dump();
  });
});
