const { manager, coolPeopleRoomId, funnyPeopleRoomId } = require('./config');
const NotificationProcedure = require("./message-notification");
const ChatRoom = require("./room");
const User = require("./user");

const coolPeopleRoom = new ChatRoom('Cool Room', coolPeopleRoomId);
const funnyPeopleRoom = new ChatRoom('Only Funny People Allowed', funnyPeopleRoomId);
const notifyNewMessages = new NotificationProcedure('New message received!');

manager.addContext(coolPeopleRoom).addContext(funnyPeopleRoom);

manager.addProcedure(notifyNewMessages, coolPeopleRoomId);
manager.addProcedure(notifyNewMessages, funnyPeopleRoomId);

const james = new User('James');
const robert = new User('Robert');
const mary = new User('Mary');
const nancy = new User('Nancy');

james.join(coolPeopleRoom);
robert.join(coolPeopleRoom);
mary.join(funnyPeopleRoom);
nancy.join(coolPeopleRoom);

// See the magic happen!
james.writeMessage('Hello World!');
mary.writeMessage('Hey Everyone!');