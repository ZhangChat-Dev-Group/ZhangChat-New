/*
  Description: Display text on targets screen that only they can see
*/

import { verifyText } from "../utility/_StringTester";

// module main
export async function run(core, server, socket, payload) {
  if (!socket.replyNick) return server.reply({
    cmd: 'warn',
    text: '还没有人给你发私信哦'
  }, socket)

  const data = {
    cmd: 'whisper',
    nick: socket.replyNick,
    text: payload.text,
  }
  core.commands.handleCommand(server, socket, data)
}

export const info = {
  id: 'root.zhangsoft.zhangchat.reply',
  name: 'reply',
  description: '回复上一个私信你的人',
  aliases: ['r'],
  usage: `
    API: { cmd: 'reply', text: '<text to whisper>' }
    发送 /reply <信息>
    发送 /r <信息>`,
  runByChat: true,
  dataRules: [
    {
      name: 'text',
      required: true,
      verify: text => !!verifyText(text),
      all: true
    }
  ]
};
