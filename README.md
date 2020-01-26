[![Build Status](https://travis-ci.org/flgmjr/birbs.svg?branch=master)](https://travis-ci.org/flgmjr/birbs)

# Birbs 

Capture and admire all your joyful events with this event manager!

-------
## What is Birbs?
Birbs is a tool to help you deal with events in a semantic declarative fashion. With it, it is possible to decouple your application without losing track of the whole process as a business perspective, while also keeping the code organized.

## Ok, But Why Birbs?
Whenever programming or designing any application, we need to setup communication and data transferring between multiple parts of it. The problem comes when a system meets the barrier all systems face at some point: The manageability of complex Interfaces, the increasing number of classes and how to maintain them decoupled. As long as that codebase keeps enlarging, we know it gets harder to keep it [SOLID](https://en.wikipedia.org/wiki/SOLID).

Although Node's plain events can be more than enough to get that desired decoupling, it could also do better! Birbs provides the funcionality of Node's events with a sweet sweet interface that requires almost no extra work to be done!

## And How Does That Work? 
Birbs gives context and extensibility to Node's events.

This library proposes that an Event and the effect it has in your application should be self contained. This means that your Event represents the modification to the context and to the state of your application.

For instance, let's say we have a Supermarket Application. We would need a `MeatDepartment` domain and a `FruitDepartment` domain; They would be Contexts of our application. For these both, we need a function or method called `weightProduct()`. With Birbs we can have a `Procedure` for this task, and execute it in any of the contexts.

The Procedure of wheighting the products makes a modification to the context they're in. For example, it could set a property of the context `measuredProductsWeight`, used when the checkout is wanted

## How to install?
```
npm i birbs --save
```

-----
## Pratical Examples:
### **Messaging Application:** *Notifications [Js]*

Let's say here we got to do a chat Application. We would like to have the features of different Rooms and message notifications!

For the sake of simplicity, we will not create all the servers and routes, just execute it in Node directly. Also the imports are omitted.
