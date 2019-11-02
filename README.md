# Birbs 
[![Build Status](https://travis-ci.org/flgmjr/birbs.svg?branch=master)](https://travis-ci.org/flgmjr/birbs)

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

Birbs is an Event encapsulator that gives context and extensibility to Node's plain events. It's objective is to bring the marvels of encapsulation and polymorphism of OOP into the world of Events, and doing that in a easily pluggable fashion!

By encapsulating your application's events, it is possible to control all the flow of your application and decouple many parts of it, allowing you to reuse your routines and procedures and make them have different impacts depending on the context they're in. Let's say for example you have a Super Market application. There you have a `MeatDepartment` domain and a `FruitDepartment` domain. For theese both you need a function or method called `getWeight()`. With birbs it is possible to have a `Procedure` with this name, and use it to either weight Meat or Fruits!

Having that kind of use in mind, Birbs is designed to be effortlessly pluggable in your already mature application, or help you develop a new one, entirely event-oriented from scracth, for you to have a much more wholesome (and controlled) experience when dealing with events. 

Also, it is internally built on Node's internal robust events engine, and got no other dependency at all!

Oh, it also uses typescript!

## How to install?
```
npm i birbs --save
```

## Example: Chat Application _[js]_
>_For a more detailed explanation of each class, refer to the `API Reference` section._

Let's say here we got to do a chat Application. We would like to have the features of different Rooms and message notifications!

For the sake of simplicity, we will not create all the servers and routes, just execute it in Node directly.

1. Let's create the class for our `ChatRoom`!
   ```javascript
   // ChatRoom.js

   import { Context } from 'birbs'
   //          or
   const { Context } = require('birbs');

   module.exports = class ChatRoom extends Context {
     constructor (name) {
       super();
       this.chatRoomName = name;
       this.messages = [];
       this.participants = [];
     }

     receive (user) {
       this.participants.push(user);
     }

     post (message) {
       this.messages.push(message);

       // Later we will notify our users here! ;)
     }

     get latestMessage () {
       return this.messages[this.messages.length -1];
     }
   }
   ```
   Extending Context means that the class contains relevant data and information about the domain it's talking about, or means that it represents the domain itself.

   Later on you will realize that all the wiring can be done outside of the class files, so it's possible to use all the features Birbs can provide without having it standing between you and your application.

2. Now let's also create the `User` and `Message`.
   ```javascript
   // User.js
   module.exports = class User {
      constructor (userName) {
        this.userName = userName;
        this.messagesWritten = [];
        this.unreadNotifications = [];
        this.currentChatRoom = null;
      }

      join (chatRoom) {
        chatRoom.receive(this);
        this.currentChatRoom = chatRoom;
      }

      writeMessage (messageContent) {
        const aMessage = new Message(
          messageContent, this.userName
        );

        this.currentChatRoom.post(aMessage);
      }
   };
   ```

   ```javascript
   // Message.js
   class Message {
     constructor (content, author) {
       this.content = content;
       this.author = author;
     }
   }
   ```

3. We already have the main functionality, now let's add our application's `Procedures` and `Effects`.
   ```javascript
   // NotificationProcedure.js
   import { Procedure } from 'birbs'
   //          or
   const { Procedure } = require('birbs');

   module.exports = class NotificationProcedure extends Procedure {
     constructor (baseMessage) {
       super();
       this.baseMessage = baseMessage;
     }
   }
   ```
   We'll just add a custom notification message in this procedure for now.

   ```javascript
   // LogNotificationEffect.js
   module.exports = class NotifyNewMessage {
     execution(notification) {
       // This method recieves as an arugment the Procedure
       // it belongs, and is bound to the context it's fired at.

       console.log(
         `${notification.baseMessage}
          room: ${this.chatRoomName}
          author: ${this.latestMessage.author}
          message: ${this.latestMessage.content}`
       );
     }
   }
   ```
   We call the classes with `execute(Procedure)` Effects. If we would be using typescript, we would need to `implement` it.

4. Let's wire everything up!

   Until now we have just programmed our application as we would if we did not use Birbs, afterall we just extended our classes.

   That is a good thing for us, it means that you can use Birbs without having to worry about it most of the time, but now we will need to set our events (Procedures) and Contexts to be used!

   ```javascript
   // main.js
   // Import/Require all extended Classes here

   // setup your Notification Procedure
   const notificationId = Symbol('notification');
   const notifyNewMessages = new NotificationProcedure('New message received!')
     .withIdentifier(notificationId)
     .withType('permanent')
     .withEffect(new NotifyNewMessage())
     .build()

   // setup your rooms
   const coolPeopleRoomId = Symbol('coolPeople')
   const coolPeopleRoom = new ChatRoom('Cool People')
     .withIdentifier(coolPeopleRoomId)
     .withStrategy('no-flush')
     .withProcedures(notifyNewMessages)
     .build();
   
   const funnyPeopleRoomId = Symbol('funnyPeople')
   const funnyPeopleRoom = new ChatRoom('Funny People')
     .withIdentifier(funnyPeopleRoomId)
     .withStrategy('no-flush')
     .withProcedures(notifyNewMessages)
     .build();
   ```
   You probably realized the use of `Symbol()`. Birbs uses symbols internally to ensure unique keys and identifiers, so even if you might mess up and give two things the same name, Birbs will know their difference. Also, Symbols enable you to get a better decoupling because you will never really need to refer to the original class instance more than once.

   Oh, let's not forget to change our comment on the `ChatRoom` class!

   ```javascript
   // ChatRoom.js
   {...}

   post (message) {
       this.messages.push(message);

       // You will need a reference to the
       // id of your procedure when executing it.
       this.publish(notificationId);
   }
   ```

5. We are ready! Let's chat!

    ```javascript
    // app.js

    const james = new User('James');
    const robert = new User('Robert');
    const mary = new User('Mary');
    const nancy = new User('Nancy');

    james.join(coolPeopleRoom);
    mary.join(funnyPeopleRoom);

    // See the magic happen!
    james.writeMessage('Hello World!');
    mary.writeMessage('Hey Everyone!');
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