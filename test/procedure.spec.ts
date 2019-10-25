import { Context } from '../src/context/context';
import { expect } from 'chai';
import { Procedure } from '../src/procedure/procedure';

describe('Procedure methods', () => {
  it('Procedure Builder works' ,() => {
    const myIdentifier = Symbol('behaviourID');
    const myType = 'once';

    const dev = new Procedure()
      .withIdentifier(myIdentifier)
      .withType(myType)
      .build();

    expect(dev.identifier).to.be.equal(myIdentifier);
    expect(dev.type).to.be.equal(myType);
  });

  it('Procedure extension and Actions works', () => {
    const myIdentifier = Symbol('behaviourID');
    const myType = 'once';

    class CustomImplementation extends Procedure {
      public isTropical = false;
      public randomString : string;

      public constructor(randomString : string) {
        super();
        this.randomString = randomString;
      }
    }

    const customAction = (ev : CustomImplementation, context : Context) : void  => {
      ev.isTropical = true;
      console.log(context);
      console.log(ev);
    };

    const dev = new CustomImplementation('halal')
      .withIdentifier(myIdentifier)
      .withType(myType)
      .withAction(customAction)
      .build();

    dev.Act();
    expect(dev.isTropical).to.be.equal(true);
  });
});
