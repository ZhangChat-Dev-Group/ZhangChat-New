/*
  Description: Removes the target socket from the current channel and forces a join event in another
*/

import * as UAC from '../utility/UAC/_info';
import { verifyNick, verifyChannel } from '../utility/_StringTester'

// module main
export async function run(core, server, socket, data) {
  let target = server.findSocket({
    channel: socket,
    nick: data.nick,
  })
  if (!target) return socket.replyInfo(`找不到 ${data.nick}`)
  if (core.permissions.inPermissionGroup(target.trip, 'root.zhangsoft.zhangchat.group.mod')) return server.reply({
    cmd: 'warn',
    text: `您不能移动 ${data.nick}，因为对方属于管理员权限组`
  }, socket)
  server.broadcast({
    cmd: 'info',
    text: `已将 ${target.nick} 移出该频道`
  }, { channel: socket.channel })
  target.channel = null
  server.broadcast({
    cmd: 'onlineRemove',
    nick: target.nick
  }, { channel: target.channel })

  let onlineSet = {
    cmd: 'onlineSet',
    nicks: [],
    users: [],
  }
  for (let s of server.findSockets({ channel: data.channel })) {
    s.reply({
      cmd: 'onlineAdd',
      ...UAC.getUserDetails(target),
      channel: s.channel,
    })
    onlineSet.nicks.push(s.nick)
    onlineSet.users.push({
      ...UAC.getUserDetails(s),
      isme: false
    })
  }

  target.channel = data.channel
  onlineSet.nicks.push(target.nick)
  onlineSet.users.push({
    ...UAC.getUserDetails(target),
    isme: true,
  })
  target.reply(onlineSet)
  server.broadcast({
    cmd: 'info',
    text: `已将 ${target.nick} 移入该频道`
  }, { channel: target.channel })
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 将 ${target.nick} 从 ?${socket.channel} 移动到 ?${target.channel}`
  }, { _group: 'root.zhangsoft.zhangchat.group.member' })
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}
export const info = {
  id: 'root.hackchat.moveuser',
  name: 'moveuser',
  aliases: ['mvuser'],
  description: '将目标用户移动到指定频道',
  usage: `
    发送 /moveuser  <目标用户> <目标频道>
    API: { cmd: 'moveuser', nick: '<target nick>', channel: '<new channel>' }`,
  runByChat: true,
  dataRules: [
    {
      name: 'nick',
      required: true,
      verify: verifyNick,
    },
    {
      name: 'channel',
      required: true,
      verify: verifyChannel,
    },
  ]
};
