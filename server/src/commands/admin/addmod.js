/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import { verifyTrip } from '../utility/_StringTester'

// module main
export async function run(core, server, socket, data) {
  core.permissions.joinPermissionGroup(data.trip, 'root.zhangsoft.zhangchat.group.mod')
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 添加管理员：${data.trip}`
  }, { _group: 'root.zhangsoft.zhangchat.group.mod' })
  core.permissions.save(true)
}

export const approve = {
  groups: ['root.hackchat.mods.add']
}
export const info = {
  id: 'root.zhangsoft.zhangchat.mods.add',
  name: 'addmod',
  aliases: ['modadd'],
  description: '将目标识别码添加到管理员权限组中',
  usage: `
    发送 /addmod <识别码>
    API: { cmd: 'addmod', trip: '<target trip>' }`,
  dataRules: [{
    name: 'trip',
    verify: verifyTrip,
    required: true,
  }],
  runByChat: true,
};
