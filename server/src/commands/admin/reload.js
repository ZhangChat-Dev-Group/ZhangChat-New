/*
  Description: Clears and resets the command modules, outputting any errors
*/

// module main
export async function run(core, server, socket, data) {
  // do command reload and store results
  let loadResult = core.dynamicImports.reloadDirCache();
  loadResult += core.commands.loadCommands();

  // clear and rebuild all module hooks
  server.loadHooks();

  // build reply based on reload results
  if (loadResult === '') {
    loadResult = `已重载 ${core.commands.commands.length} 个命令，暂无报错，祝你好运`;
  } else {
    loadResult = `已重载 ${core.commands.commands.length} 个命令，报错信息：
      ${loadResult}`;
  }

  core.logger.info(loadResult)

  // send results to moderators (which the user using this command is higher than)
  server.broadcast({
    cmd: 'info',
    text: loadResult,
  }, { _group: 'root.zhangsoft.zhangchat.group.mod' });

  return true;
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.admin']
}
export const info = {
  id: 'root.hackchat.reload',
  name: 'reload',
  description: '热重载所有命令模块',
  usage: `
    发送 /reload
    API: { cmd: 'reload' }
    代码不会陪你演戏，你糊弄代码，代码就会糊弄你`,
  runByChat: true,
};
