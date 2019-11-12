# Birbs 
[![Build Status](https://travis-ci.org/flgmjr/birbs.svg?branch=master)](https://travis-ci.org/flgmjr/birbs)

Capture and admire all your joyful events with this event manager and encapsulator!

--------------------
#### A Quick Heads'up

> We will soon update to version `0.5`, which will be the first production-ready package!
> Is there something you would like to see in Birbs? I'd like to hear it! [Tell me!](https://github.com/flgmjr/birbs/issues/new)

------------------
## Table of Contents
- [Why Birbs?](https://github.com/flgmjr/birbs#what-is-birbs-why-birbs)
- [Examples](https://github.com/flgmjr/birbs#example-chat-application-js)
- [API Reference](https://github.com/flgmjr/birbs#api-reference)
  - [EventManager](https://github.com/flgmjr/birbs#eventmanager)
  - [Context](https://github.com/flgmjr/birbs#context)
  - [Procedure](https://github.com/flgmjr/birbs#procedure)
  - [Effect](https://github.com/flgmjr/birbs#effect)
- [Roadmap](https://github.com/flgmjr/birbs#roadmap)

## What is Birbs? Why Birbs?

Birbs is an Event encapsulator that gives context and extensibility to Node's plain events. Its objective is to bring the marvels of encapsulation and polymorphism of OOP into the world of Events, and doing that in an easily pluggable fashion!

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
     .withLifecycle('permanent')
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
       this.trigger(notificationId);
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

Before everything, let's talk about our names. In birbs there are four important names for you to know: `EventManager`, `Context`, `Procedure`, and `Effect`. EventManager is the easier one to understand, it's the entity that you can use to broadcast an event to a context withoutt having any reference to neither, just their Ids.

Now for the other three, it is better to first understand their relation. Contexts have Procedures to use or execute in its lifetime. Procedures each have at least one Effect to be triggered when needed. Context don't know about Effects, but Effects have direct references to the context that triggered their procedure. When a procedure is used, the control is passed from the context, to the procedure, into the effect.

#### Notes:
- Birbs has native support for typescript.
- Birbs classes does not use Constructors, they use builders.

## EventManager
It is the entity that you can use to trigger a Procedure in a Context. It is also possible to use it as a context group.

### EventManager.addContext()
_Adds a context to an EventManager. Returns the EventManager_

```javascript
  EventManager.addContext(context: Context);
```

### EventManager.removeContext()
_Removes a context from an EventManager. Returns the EventManager_

```javascript
  EventManager.removeContext(context: Context | symbol);
```

### EventManager.fetchContext()
_fetches a context from an EventManager. Returns a Context or undefined_

```javascript
  EventManager.removeContext(context: Context | symbol);
```

### EventManager.broadcast()
_Triggers a Procedure execution. Returns the EventManager_

The context argument is optional. If ommited, the manager will try triggering the Procedure in all of its Contexts

```javascript
  EventManager.broadcast(
    procedure : Procedure | symbol,
    context ?: Context | symbol
  );
```
### EventManager.addProcedure()
_Adds a Procedure to a Context. Returns the EventManager_

```javascript
  EventManager.addProcedure(
    procedure : Procedure,
    context : Context | symbol
  );
```

### EventManager.removeProcedure()
_Removes a Procedure to a Context. Returns the EventManager_

```javascript
  EventManager.removeProcedure(
    procedure : Procedure,
    context : Context | symbol
  );
```

## Context
Context is the entity that holds the data that defines a domain in you application, or is the domain itself. For example, our `MeatDepartment` would need the available meat cuts and the clients we're serving.

The Context can be accessed in the Effect by using the `this` keyword.

Contexts have a special mechanics which is the FlushStrategy. Whenever the Context triggers a Procedure, it needs to be either discarded (if the procedure is 'ephemeral'), or maintained (if it is 'permanent'). The FlushStrategy is set to choose whether to discard all ephemeral Procedures when any Procedure of it is triggered or to not discard any. The logic goes like the following:

| Procedure Type | Context Strategy | Result                                    |
|----------------|------------------|-------------------------------------------|
| "ephemeral"    | "no-flush"       | Only the triggered Procedure is discarded |
| "ephemeral"    | "each-trigger"   | All "ephemeral" Procedures are discarded  |
| "permanent"    | "no-flush"       | No Procedures discarded                   |
| "permanent"    | "each-trigger"   | All "ephemeral" Procedures are discarded  |

Triggered "ephemeral" Procedures are always discarded, while "permanent" are never discarded.

Contexts need to be built to use. Here we will cover the building methods.

### ContextBuilder.withIdentifier()
_Adds the identifier to the context that is to be built._
_Returns the ContextBuilder._
This is required to build the context.

You can either create the symbol and use it in this modifier or input a string and retrieve the synbol of it later with `.identifier`.

```javascript
  ContextBuilder.withIdentifier(identifier: symbol | string) ;
```

### ContextBuilder.withProcedures()
_Adds procedures to the context that is to be built._
_Returns the ContextBuilder._

```javascript
  ContextBuilder.withProcedures(procedure: Procedure | Procedure[]);
```

### ContextBuilder.withStrategy()
_Sets the flushing strategy of the context that is to be built._
_Returns the ContextBuilder._
this is required to build the Context.

```javascript
  ContextBuilder.withProcedures(procedure: Procedure | Procedure[]);
```

### ContextBuilder.build()
_Apply all modifications added and returns the built context._

This builder method also accepts an optional argument that can be used as a "lazy" builder. You can input it with an object with the following parameters (all optional):
```javascript
{
  identifier : symbol | string,
  strategy : string
}
```
The lazy builder has priority when using alongside the normal builder. This means that if there is an `identifier` already set with modifications, it will be overriten by the lazy builder's `identifier`.
```javascript
  ContextBuilder.build();
```

### Context.sign()
_Signs a procedure in the context. Returns the context_

```javascript
  Context.sign(procedure: Procedure);
```

### Context.resign()
_Resigns/Removes a procedure from the context. Returns the context_

```javascript
  Context.resign(procedure: Procedure);
```

### Context.getProcedure()
_Fetches a procedure by its Identifier. Returns a procedure or undefined_

```javascript
  Context.getProcedure(procedureId: symbol);
```

### Context.hasProcedure()
_Checks if the context has a procedure. Returns a boolean_

```javascript
  Context.hasProcedure(procedureId: symbol | Procedure);
```

### Context.flushingStrategy > _getter_
_Gets the context's flushing strategy_

### Context.identifier > _getter_
_Gets the context's identifier_

### Context.identifierName > _getter_
_Gets the string of a context's identifier_

## Procedure
Procedure is the entity that encapsulates or groups a set of informations and fields regarding an action that your application takes. For example, throwing an especific error could be a valid procedure, Logging out an user could be one as well.

Procedures has an important property "Lifecycle", which sets the execution type of it. If you set it to `ephemeral`, the procedure can be executed only once per sign (when it's signed in a context). If you set it to `permanent`, it will stay there until resigned.

Procedures also have a builder.

### ProcedureBuilder.withIdentifier()
_Adds the identifier to the procedure that is to be built._
_Returns the ProcedureBuilder._
This is required to build the Procedure

You can either create the symbol and use it in this modifier or input a string and retrieve the synbol of it later with `.identifier`.
```javascript
  procedureBuilder.withIdentifier(identifier: symbol | string);
```

### ProcedureBuilder.withLifecycle()
_Sets the type of the procedure that is to be built._
_Returns the ProcedureBuilder._
This is required to build the Procedure

type can be either "ephemeral" or "permanent".

```javascript
  procedureBuilder.withLifecycle(type: string);
```

### ProcedureBuilder.withEffect()
_Adds an Effect to the procedure that is to be built._
_Returns the ProcedureBuilder._
This is required to build the Procedure

```javascript
  procedureBuilder.withEffect(effect: Effect);
```

### ProcedureBuilder.build()
_Apply all modifications added and returns the built procedure._

This builder method also accepts an optional argument that can be used as a "lazy" builder. You can input it with an object with the following parameters (all optional):
```javascript
{
  identifier : symbol | string,
  lifecycle : string,
  effects : Effect[],
}
```
The lazy builder has priority when using alongside the normal builder. This means that if there is an `identifier` already set with modifications, it will be overriten by the lazy builder's `identifier`.

```javascript
  ProcedureBuilder.build();
```

### Procedure.lifecycle > _getter_
_gets the procedure's lifecycle type._

### Procedure.effects > _getter_
_gets the procedure's effects (Array)_

### Procedure.identifier > _getter_
_gets the procedure's identifier_

## Effect
Our last entity is the most simple one. It's not even a concrete class. Effect is the representation of a part of a Procedure. We called it Effect since we're working with events here, it's the _Effect_ of a Procedure happening in your application.

If you're working with Javascript, you can write your effect by just placing a method on a class or object called `execution()`. In typescript, import it and have your Effect `implements` it.

`execution()` Must be unbound.

An important thing to notice is that it is possible to have multiple Effects in a Procedure, and if that is the case, they are all executed in parallel.

### Effect's execution interface:
The method recieves one parameter that is the Procedure it belongs, and has the context that its Procedure was triggered bound to it. This means that we have a single argument and when we type `this`, we are reffering to a context.

```javascript
execution(procedure : Procedure) {
  console.log(procedure) // Logs the procedure
  console.log(this) // Logs the context
}
```

## Utils
We have packaged some helper functions for you to use with birbs. Here's their examples and references.

### `utils.toNewEffect()`
_Creates an Effect from the function input. and returns it_

This function accepts a single argument, which is another function or a callback which you want to turn into an Effect. Keep in mnind that using this function is not recommended when building new applications, it shines the most when used in mature applications to start implementing birbs to its full potential.

The argument must be an unbound function.

```javascript
import { utils } from 'birbs';

function hello (procedure) {
  console.log(`hello ${procedure.name}`);
};

const helloEffect = utils.toNewEffect(hello);
// helloEffect now can be used in ".withEffect()"
```

-------
# Roadmap / Changelog
Hey! You got till the end!
I hope you liked this package and it's being useful for you. Now let's check what is next!

- **v0.5**
  - Have more reliable tests;
  - ~~More strict entity checks to avoid unexpected states~~;
  - ~~Have a short builder that accepts an object with the options~~;
  - ~~Also accept strings in the `.withIdentifier()` clauses~~;
  - ~~Have a helper function that makes a method or function into an Effect~~;
- **v0.6**
  - Add Pipeline Entity (Sequential effects);
- **v0.7**
  - Add Event History;
  
You are very welcome to contribute to this list! just head to the [gitHub Page](https://github.com/flgmjr/birbs/issues/new)!