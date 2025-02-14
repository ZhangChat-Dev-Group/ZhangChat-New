/*
  Description: Broadcasts an emote to the current channel
*/

import { verifyText } from "../utility/_StringTester";
import { getUserDetails } from "../utility/UAC/_info";

// module main
export async function run(core, server, socket, payload) {
  // check user input
  let text = verifyText(payload.text);

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.reply({
      cmd: 'warn',
      // 被娘化的服务器 致敬曾经的XChat
      text: '# 你干嘛~ 哈哈哎哟~\n服务器娘经受不住你那富有激情的文字 要崩溃咯\n请稍等一会儿再聊',
    }, socket);
  }

  if (!text.startsWith("'")) {
    text = ` ${text}`;
  }

  const newPayload = {
    cmd: 'info',
    type: 'emote',
    text: `@${socket.nick}${text}`,
    ...getUserDetails(socket),
  };

  // broadcast to channel peers
  server.broadcast(newPayload, { channel: socket.channel });

  return true;
}
export const info = {
  id: 'root.hackchat.emote',
  name: 'emote',
  description: '以第三人称表示自己的状态',
  aliases: ['me'],
  usage: `
    API: { cmd: 'emote', text: '<emote/action text>' }
    发送 /me <文本>`,
  runByChat: true,
  dataRules: [{
    name: 'text',
    required: true,
    verify: text => !!verifyText(text),
    all: true,
  }],
};
