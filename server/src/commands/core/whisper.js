/*
  Description: Display text on targets screen that only they can see
*/

import { verifyNick, verifyText } from "../utility/_StringTester";

// module main
export async function run(core, server, socket, payload) {
  // check user input
  const text = verifyText(payload.text);

  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.reply({
      cmd: 'warn',
      text: '# 你干嘛~ 哈哈哎哟~\n服务器娘经受不住你那富有激情的文字 要崩溃咯\n请稍等一会儿再聊',
    }, socket);
  }

  let target = server.findSocket({
    channel: socket.channel,
    nick: payload.nick,
  })
  if (!target) return server.reply({
    cmd: 'warn',
    text: `找不到名为 ${payload.nick} 的用户`
  }, socket)

  server.reply({
    cmd: 'info',
    type: 'whisper',
    from: socket.nick,
    msg: text,
    text: `${socket.nick} 给你发了私信：${text}`
  }, target)
  server.reply({
    cmd: 'info',
    text: `你给 ${target.nick} 发送了私信：${text}`
  }, socket)

  target.replyNick = socket.nick
}

export const info = {
  id: 'root.hackchat.whisper',
  name: 'whisper',
  description: '向一个目标用户发送私信',
  aliases: ['w'],
  usage: `
    API: { cmd: 'whisper', nick: '<target name>', text: '<text to whisper>' }
    发送 /whisper <目标用户> <信息>
    发送 /w <目标用户> <信息>
    附加：发送 /r <信息> 即可快速回复上一位私信你的人`,
  runByChat: true,
  dataRules: [
    {
      name: 'nick',
      required: true,
      verify: verifyNick
    },
    {
      name: 'text',
      required: true,
      verify: text => !!verifyText(text),
      all: true
    }
  ]
};
