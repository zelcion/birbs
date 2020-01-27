const { manager, coolPeopleRoomId, funnyPeopleRoomId } = require('./config');
const ChatRoom = require("./room");
const User = require("./user");
const MessagePipeline = require('./message-pipeline');

const coolPeopleRoom = new ChatRoom('Cool Room', coolPeopleRoomId);
const funnyPeopleRoom = new ChatRoom('Only Funny People Allowed', funnyPeopleRoomId);

manager.addContext(coolPeopleRoom).addContext(funnyPeopleRoom);

manager.addProcedure(MessagePipeline, coolPeopleRoomId);
manager.addProcedure(MessagePipeline, funnyPeopleRoomId);

const james = new User('James');
const robert = new User('Robert');
const nancy = new User('Nancy');
const mary = new User('Mary');
const nick = new User('Nick');

james.join(coolPeopleRoom);
robert.join(coolPeopleRoom);
nancy.join(coolPeopleRoom);

mary.join(funnyPeopleRoom);
nick.join(funnyPeopleRoom);

// See the magic happen!
james.writeMessage('Hello World!');
robert.writeMessage('Well, hello to you too, James.');
nancy.writeMessage('How are you guys doing?');

mary.writeMessage('Hey Everyone!');
nick.writeMessage('Hello Mary :D');
