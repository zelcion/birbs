const { Procedure } = require("../../lib");

module.exports = class MessageSendProcedure extends Procedure {
  async execute(context, descriptable) {
    context.post(descriptable);
  }
}