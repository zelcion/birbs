const { Context } = require("../../lib");
const { manager } = require("./config");

module.exports = class ChatRoom extends Context {
  constructor (name, id) {
    super(id);
    this.chatRoomName = name;
    this.messages = [];
    this.participants = [];
  }

  receive (user) {
    this.participants.push(user);
  }

  post (message) {
    this.messages.push(message);

    manager.broadcast('NotificationProcedure', this.identifier);
  }

  get latestMessage () {
    return this.messages[this.messages.length -1];
  }
}
