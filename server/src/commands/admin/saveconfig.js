/*
  Description: Writes the current config to disk
*/

// module main
export async function run(core, server, socket) {
  // attempt save, notify of failure
  if (!core.configManager.save()) {
    return server.reply({
      cmd: 'warn',
      text: '无法保存配置文件 请检查日志',
    }, socket);
  }

  server.broadcast({
    cmd: 'info',
    text: '配置文件保存成功',
  }, { _group: 'root.zhangsoft.zhangchat.group.mod' });

  if (!core.permissions.save()) {
    return server.reply({
      cmd: 'warn',
      text: '无法保存权限表 请检查日志',
    }, socket);
  }

  server.broadcast({
    cmd: 'info',
    text: '权限表保存成功',
  }, { _group: 'root.zhangsoft.zhangchat.group.mod' });

  return true;
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.admin']
}

export const info = {
  id: 'root.hackchat.saveconfig',
  name: 'saveconfig',
  aliases: ['save'],
  description: '手动将配置文件和权限表写入硬盘',
  usage: `
    发送 /saveconfig
    API: { cmd: 'saveconfig' }`,
  runByChat: true,
};
