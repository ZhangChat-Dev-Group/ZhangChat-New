import { verifyTrip } from '../utility/_StringTester'

// module main
export async function run(core, server, socket, data) {
  core.permissions.joinPermissionGroup(data.trip, 'root.zhangsoft.zhangchat.group.member')
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 添加了成员：${data.trip}`
  }, { _group: 'root.zhangsoft.zhangchat.group.member' })
  core.permissions.save(true)
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}
export const info = {
  id: 'root.zhangsoft.zhangchat.members.add',
  name: 'addmember',
  aliases: ['memberadd'],
  description: '将目标识别码添加到成员权限组中',
  usage: `
    发送 /addmember <识别码>
    API: { cmd: 'addmember', trip: '<target trip>' }`,
  dataRules: [{
    name: 'trip',
    verify: verifyTrip,
    required: true,
  }],
  runByChat: true,
};
