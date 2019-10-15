# Birbs
Capture and admire all your joyful events with this event manager and encapsulator!

--------------------
#### A Quick Heads'up

> We updated to version `0.5`, which is the first production-ready package!
> There are still some things on the roadmap which will greatly increase Birbs' functionality. When those are implemented we will be moving to our `1.x.x` packages.

## What is Birbs? Why Birbs?

Birbs is an Event encapsulator that gives context and extensability to node's plain events. It's objective is to bring the marvels of encapsulation and polymorfism of OOP into the world of Events!

For instance, with it you can reuse a `Behaviour` of your application in different contexts, let's say an error handler for an API response. Just bind the handler to a `Behaviour` and `.broadcast()` it to it's `Container`!

Birbs is internally built on Node's internal robust events engine, and got no other dependency at all! Also it helps you to encapsulate expected behaviors in namespaces for you to have a much more wholesome (and controlled) experience when dealing with events. 

Personally, I find it helpful to dispatch events with multiple listeners, which are to be executed only once, and are instantiated every call to expect a response.

Oh, it also uses typescript!

## How to install?
```
npm i birbs --save
```

## How to use it?
_For a more detailed explanation of each class, refer to the `API Reference` section._
1. Import Birbs' classes to your project, set the Container and EventManager, and add the context to the Manager.
   ```javascript
   import { Behaviour, Container, EventManager } from 'birbs'
   //                      or
   const { Behaviour, Container, EventManager } = require('birbs');

   const myEventManager = new EventManager();
   const contextIdentifier = Symbol('ContainerIdentity')
   const myContext = new Container(contextIdentifier, 'once');
   // see flushStrategies to know about this second argument
   myEventManager.addContainer(myContext);
   ```
   One important thing to notice is that although you can use pure strings as Identifiers, Birbs uses symbols internally, so if you opt to use strings to name your Containers/Behaviours you will need to save them to constants or you won't be able to fetch them later. So keep in mind that symbols are a good practice with Birbs, and they enable you to get a better decoupling because you will never really need to refer to the original class instance.

   Oh, also you will be able to do a really clever use of some methods when the same behaviour is shared across contexts ;)

2. Create (and/or extend) your Behaviour.
   ```javascript
   class MyNewBehaviour extends Behaviour {
      get myExtendedProperty () {
        return 'hello world';
      }
   };

   const newBehaviourIdentifier = Symbol('BehaviourId');

   const newBehaviourInstance = new MyNewBehaviour(
     { identifier: newBehaviourIdentifier, type: 'always' }
    )
   // see Behaviour Types in the API Reference 
   ```

3. Create and add Actions to take when the event is fired.
   ```javascript
   const showMeTheWorld = (behaviour) => {
     console.log(behaviour.myExtendedProperty);
   };
   const showMeTheWorldIdentifier = Symbol('showMeTheWorld');
   // It is possible to overwrite an action if you .bindAction()
   // again with the same identifier (if it's a symbol).
   newBehaviourInstance.bindAction(
     showMeTheWorld,
     showMeTheWorldIdentifier
   );
   ```
   Your Actions functions/callbacks recieves as an argument the Behaviour itself, which makes possible for interesting applications to be made.

4. Broadcast your new behaviour!
   ```javascript
   myEventManager.broadcast(
     newBehaviourIdentifier,
     contextIdentifier
   );
   // Should log 'hello world'
   ```

## API Reference
> Under construction.