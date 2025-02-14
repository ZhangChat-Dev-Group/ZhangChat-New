/*
  Description: Generates a semi-unique channel name then broadcasts it to each client
*/

import { verifyChannel, verifyNick } from "../utility/_StringTester";

/**
  * Returns the channel that should be invited to.
  * @param {any} channel
  * @return {string}
  */
export function getChannel() {
  return Math.random().toString(36).substr(2, 8);
}

// module main
export async function run(core, server, socket, data) {
  let target = server.findSocket({
    channel: socket.channel,
    nick: data.nick
  })
  if (!target) return server.reply({
    cmd: 'warn',
    text: `找不到用户 \`${data.nick}\``
  }, socket)

  let channel = data.channel || getChannel()
  server.reply({
    cmd: 'info',
    type: 'invite',
    channel,
    text: `${socket.nick} 邀请你去 ?${channel}`
  }, target)
  server.reply({
    cmd: 'info',
    text: `你邀请 ${target.nick} 去 ?${channel}`
  }, socket)

  core.stats.increment('invites-sent')
}

export const requiredData = ['nick'];
export const info = {
  id: 'root.hackchat.invite',
  name: 'invite',
  rateLimit: 2,
  description: '向目标用户发送邀请信息',
  usage: `
    发送 /invite <目标用户> <目标频道（可选）>
    API: { cmd: 'invite', nick: '<target nickname>', channel: '<optional destination channel>' }`,
  runByChat: true,
  dataRules: [
    {
      name: 'nick',
      required: true,
      verify: verifyNick,
    },
    {
      name: 'channel',
      required: false,
      verify: verifyChannel,
    }
  ]
};
