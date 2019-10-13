# Birbs
Capture and admire all your joyful events with this event manager and encapsulator!

--------------------
#### A Quick Heads'up
> This initial implementation will be deprecated in the near future in favor of a much more nice syntax and classes you are yet to see. So please, be warned to not use this before the planned `0.5` version, but feel welcome to open issues and feature requests!
## Why Birbs?

Birbs is internally built on Node's internal robust events engine, and got no other dependency at all! Also it helps you to encapsulate expected behaviors in namespaces for you to have a much more wholesome (and controlled) experience when dealing with events. 

Personally, I find it helpful to dispatch events with multiple listeners, which are to be executed only once, and are instantiated every call to expect a response. [See `EventGroup`]

Oh, it also uses typescript!

## How to install?
```
npm i birbs --save
```

## How to use it?
1. You need an `EventPublisher`, which is the manager of events. You should always `broadcast()` your events through it!
```javascript
const Birbs = require('birbs'); // Prefer import sintax if possible

const myEventPublisher = new Birbs.EventPublisher();
```
2. Now tell it that you just got yourself the fanciest `EventGroup` in the town!
```javascript
const fancyEventGroup = new Birbs.EventGroup('FancyName');

myEventPublisher.submitGroup(fancyEventGroup);
// You can unsubmit your group with .unsubmitGroup()
```
3. Then you should create your event to be published.
```javascript
class NiceEvent extends Birbs.DomainEvent {
  identifier = "eventFiredWithFancyEventGroup";
  // Here goes any data/methods that you want!

  // It also can have a constructor for custom data
  // during runtime
};

const niceEventInstance = new NiceEvent;
```
4. Now pair it up with a behavior you need to happen when it's fired and listen to it.
```javascript
const eventPair = new Birbs.EventPair(niceEventInstance, voidMethodOrFunction);

myEventPublisher.listen([eventPair], fancyEventGroup);
```
5. Fire!
```javascript
myEventPublisher.broadcast(niceEventInstance, fancyEventGroup);
// Then your voidMethodOrFunction should have been called!
```

### Things to notice:
1. Your event behavior function recieves as an argument the event itself, which makes possible for interesting behaviour and methods calling to be possible.
2. The `EventPair` class is to be deprecated in favour of a new method on extended `DomainEvent` classes.
3. For now there is only one `.listen()` method which loads the `EventGroup` with the expected behaviour.

## Birbs Behaviour
For now, Birbs flushes the `EventGroup` listeners everytime any event of that group is broadcasted to it, so always listen to them again when you `.broadcast()` to the group.