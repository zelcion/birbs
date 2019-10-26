import { Context } from '../src/context/context';
import { Effect } from '../src/utils/types';
import { expect } from 'chai';
import { Procedure } from '../src/procedure/procedure';

describe('Procedure methods', () => {
  it('Procedure Builder works' ,() => {
    const myIdentifier = Symbol('behaviourID');
    const myType = 'ephemeral';

    const dev = new Procedure()
      .withIdentifier(myIdentifier)
      .withType(myType)
      .build();

    expect(dev.identifier).to.be.equal(myIdentifier);
    expect(dev.lifecycle).to.be.equal(myType);
  });

  it('Procedure extension and Effects works', () => {
    const myIdentifier = Symbol('behaviourID');
    const myType = 'ephemeral';

    class CustomImplementation extends Procedure {
      public isTropical = false;
      public randomString : string;

      public constructor(randomString : string) {
        super();
        this.randomString = randomString;
      }
    }

    class CustomEffect implements Effect {
      public execution (ev : CustomImplementation) : void {
        ev.isTropical = true;
      }
    }

    const dev = new CustomImplementation('1234abcd')
      .withIdentifier(myIdentifier)
      .withType(myType)
      .withEffect(new CustomEffect())
      .build();

    const contextId = Symbol('contextId');
    const customContext = new Context()
      .withIdentifier(contextId)
      .withProcedures(dev)
      .withStrategy('no-flush')
      .build();

    customContext.publish(myIdentifier);
    expect(dev.isTropical).to.be.equal(true);
  });
});
