const Message = require("./message");

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
}
