/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

// module main
export async function run(core, server, socket, data) {
  core.permissions.joinPermissionGroup(data.trip, 'root.zhangsoft.zhangchat.group.mod')
  server.broadcast({
    cmd: 'info',
    text: `已添加管理员：${data.trip}`
  }, { _group: 'root.zhangsoft.zhangchat.group.mod' })
  core.permissions.save(true)
}

export const requiredData = ['trip'];
export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.admin']
}
export const info = {
  id: 'root.zhangsoft.zhangchat.addmod',
  name: 'addmod',
  description: 'Adds target trip to the config as a mod and upgrades the socket type',
  usage: `
    API: { cmd: 'addmod', trip: '<target trip>' }`,
};
