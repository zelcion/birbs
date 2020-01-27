const Message = require("./message");
const { manager } = require('./config');

module.exports = class User {
  constructor (userName) {
    this.userName = userName;
    this.messagesWritten = [];
    this.unreadNotifications = [];
    this.currentChatRoom = null;
  }

  join (chatRoom) {
    chatRoom.receive(this);
    this.currentChatRoom = chatRoom.identifier;
  }

  writeMessage (messageContent) {
    const aMessage = new Message(
      messageContent, this.userName
    );

    manager.broadcast('MessagePipeline', this.currentChatRoom, aMessage);
  }
}
