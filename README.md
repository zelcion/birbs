[![Build Status](https://travis-ci.org/flgmjr/birbs.svg?branch=master)](https://travis-ci.org/flgmjr/birbs)
# Birbs 
Capture and admire all your joyful events with this event manager and encapsulator!

--------------------
#### A Quick Heads'up

> Readme is under construction - It is incomplete and have some wrong info. It's highly advisable for you to wait until version 0.5 to use this package.

> We will soon update to version `0.5`, which will be the first production-ready package!
> There are still some things on the roadmap which will greatly increase Birbs' functionality. When those are implemented we will be moving to our `1.x.x` packages.

------------------
## Table of Contents
- [Why Birbs?](https://www.npmjs.com/package/birbs#what-is-birbs-why-birbs)
- [How to Install](https://www.npmjs.com/package/birbs#how-to-install)
- [How to Use (quick guide)](https://www.npmjs.com/package/birbs#how-to-use-it)
- [API Reference](https://www.npmjs.com/package/birbs#api-reference)
-  - [Behaviour](https://www.npmjs.com/package/birbs#behaviour)

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
   One important thing to notice is that although you can use pure strings as Identifiers, Birbs uses symbols internally, so if you opt to use strings to name your Containers/Behaviours you will need to save them to constants or you won't be able to fetch them later. So keep in mind that symbols are a good practice with Birbs, and they enable you to get a better decoupling because you will never really need to refer to the original class instance more than one time.

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

4. Listen, and Broadcast your new behaviour!
   ```javascript
   myEventManager.listen(newBehaviourInstance, contextIdentifier);

   myEventManager.broadcast(
     newBehaviourIdentifier,
     contextIdentifier
   );
   // Should log 'hello world'
   ```

-------
# API Reference

The Birbs API was developed with flexibility, immutability and decoupling, as basic principles, so you will notice that while there are many ways to add behaviour to a class, there are none to remove instead of not adding it at all.

While this is an ongoing project

## Behaviour > _Class_
The Behaviour class is the main class of Birbs. It contains the actions/callbacks and the data that you want it to work with.

Also, this class is MEANT to be extended, so you can add your custom properties, data, and methods to it.

### **Class Constructor**
Takes a single optional object argument.

_constructor( ?options )_

**Options** > _Object_
- Options proerties: 
- **identifier** > _string | symbol - Required_
- **type** > _BehaviourType - Required_ 

```javascript
const behaviourInstance = new Behaviour(
  { identifier: Symbol('id'), type: 'once' }
);
```

### **Behaviour.identifier > _readonly property : symbol_**
Is the value used to fetch the instance of a behaviour in a container.
```javascript
behaviourInstance.identifier // returns a symbol
```

### **Behaviour.type > _property : BehaviourType_**
Is the type used to check if the listener of this behaviour will be flushed or not, according to it's container flushing strategy.

Can have the values of: `'once'` or `'always'`.

`once` Behaviours need to be signed again each time the Container flushes or they are fired. `always` Behaviours, on the other hand, can be used indefinitely or until they are flushed.
  
```javascript
behaviourInstance.type // returns a string, either 'once' or 'always'
```

### **Behaviour.actions > _property : Map( symbol, Action )_**
Is where there are stored the callbacks called when the event is fired
```javascript
behaviourInstance.actions // returns a Map(symbol, Action)
```

### **Behaviour.bindAction( ) > _method : this_**
This method sets a key-value entry in this behaviour's actions.

Arguments:
- **action** > _Action - Required_ 
- **name** > _symbol | string - Required_

```javascript
behaviour.bindAction(action, name); //returns `this`
```

### **Behaviour.Act( ) > _method : this_**
This method fires all the actions of a Behavior. This is not intended to use manually.

Arguments:
- **action** > _Action - Required_ 
- **name** > _symbol | string - Required_

```javascript
behaviour.bindAction(action, name);
```

## Action > _Typeof Function_
The type of the funtions or methods that are accepted to be added to Behaviours.

_**function**( behaviour ) => void_
- **behaviour** > _Behaviour_
```javascript
const testAction = (behaviour) => { // is Action-compliant
  // do something
}
```

## Container > _Class_
Containers in Birbs are the unit that encapsulates the events and give them context. Different from the Behaviour, this class is not supposed to be extended.

Containers have the ability to also reset their state with different strategies, the so called `flushStrategies`, and they contain a set of methods to manipulate and fire Behaviours (But for consistency, prefer using the [EventManager](https://www.npmjs.com/package/birbs#event-manager)).

### **Class Constructor**
_constructor( identifier, type )_

- **identifier** > _symbol | string - Required_
- **type** > _('once' | 'always' | 'never') - Required_

```javascript
const containerInstance = new Container(
  Symbol('identifier'),
  'once'
);
```

###  **Container.identifier > _private readonly property : symbol_**
This property is private and has a public getter. It is equivalent to `Behaviour.identifier`.

### **Container.emitter > _private readonly property : EventEmitter_**
The extension of node's native emitter. This is private and should never be from outside Birbs' interface.