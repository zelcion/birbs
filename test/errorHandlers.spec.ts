import { describe, it } from 'mocha';
import { HandlerFunction, TriggerOptions } from '../src/types';
import { Context } from '../src/context';
import { EventManager } from '../src/manager';
import { expect } from 'chai';
import { Procedure } from '../src/procedure';

const testTimeout = (done, assertion) : void => {
  setTimeout(() => {
    assertion();
    done();
  }, 30);
};

class TestContext extends Context {
  public visibleProperty : string;

  constructor (stringValue : string, errorHandler ?: HandlerFunction) {
    super({ errorHandler, identifier: 'identifier' });

    this.visibleProperty = stringValue;
  }
};

class CrashContext extends Procedure {
  public async execute (context : TestContext) : Promise<void> {
    delete context.visibleProperty;

    context.visibleProperty.length > 1;
  };
};

class CrashProcedure extends Procedure {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async execute (context : TestContext, descriptable : any) : Promise<void> {
    context.visibleProperty = descriptable.toString();
  };
};

describe('Catch unhandled errors', () => {
  let testContext : TestContext;
  const initialPropertyValue = 'randomValueIdidNotThinkthrough';
  let eventManager : EventManager;
  beforeEach(() => {
    testContext = new TestContext(initialPropertyValue);
    eventManager = new EventManager();

    eventManager.addContext(testContext)
      .addBirbable(new CrashProcedure({ lifetime: 'DURABLE' }), 'identifier')
      .addBirbable(new CrashContext({ lifetime: 'DURABLE' }), 'identifier');
  });

  it('Manager gets the handler to the Context', (done) => {
    const testOptions : TriggerOptions = {
      birbable: 'CrashContext',
      errorHandler: (error : Error) => {
        if (error) {
          catchedError = true;
        }
      }
    };

    let catchedError = false;
    eventManager
      .broadcast(testOptions ,'thisText');

    expect(testContext.visibleProperty).to.be.equal(undefined);
    testTimeout(done, () => {
      expect(catchedError).to.be.true;
    });
  });

  it('Catches Procedure Error', (done) => {
    const testOptions : TriggerOptions = {
      birbable: 'CrashProcedure',
      errorHandler: (error : Error) => {
        if (error) {
          catchedError = true;
        }
      }
    };

    let catchedError = false;
    eventManager
      .broadcast(testOptions , null);

    expect(testContext.visibleProperty).to.be.equal(initialPropertyValue);
    testTimeout(done, () => {
      expect(catchedError).to.be.true;
    });
  });
});
