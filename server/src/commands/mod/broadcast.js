/*
  Description: Emmits a server-wide message as `info`
*/

import { verifyText } from "../utility/_StringTester";

// module main
export async function run(core, server, socket, data) {
  server.broadcast({
    cmd: 'info',
    text: `# 全站广播\n---\n${data.text}`,
  }, {});
  core.stats.increment('messages-sent')

  return true;
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}
export const info = {
  id: 'root.hackchat.shout',
  name: 'broadcast',
  aliases: ['shout'],
  description: '向全体用户发送一条信息，不论是否加入频道',
  usage: `
    API: { cmd: 'shout', text: '<shout text>' }
    发送 /broadcast <信息>`,
  runByChat: true,
  dataRules: [{
    name: 'text',
    required: true,
    verify: text => !!verifyText(text),
    all: true,
  }]
};
