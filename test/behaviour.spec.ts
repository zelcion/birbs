import { Behaviour } from '../src/behaviour/behaviour';
import { Context } from '../src/context/context';
import { expect } from 'chai';

describe('Behaviour methods', () => {
  it('Behaviour Builder works' ,() => {
    const myIdentifier = Symbol('behaviourID');
    const myType = 'once';

    const dev = new Behaviour()
      .withIdentifier(myIdentifier)
      .withType(myType)
      .build();

    expect(dev.identifier).to.be.equal(myIdentifier);
    expect(dev.type).to.be.equal(myType);
  });

  it('Behaviour extension and Actions works', () => {
    const myIdentifier = Symbol('behaviourID');
    const myType = 'once';

    class CustomImplementation extends Behaviour {
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
