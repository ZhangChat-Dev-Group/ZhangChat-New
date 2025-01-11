/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

// module main
export async function run(core, server, socket, data) {
  // add new trip to config
  core.config.mods.push({ trip: data.trip });

  // find targets current connections
  const newMod = server.findSockets({ trip: data.trip });
  if (newMod.length !== 0) {
    for (let i = 0, l = newMod.length; i < l; i += 1) {
      // upgrade privilages
      newMod[i].uType = 'mod';
      newMod[i].level = UAC.levels.moderator;

      // inform new mod
      server.send({
        cmd: 'info',
        text: 'You are now a mod.',
      }, newMod[i]);
    }
  }

  // return success message
  server.reply({
    cmd: 'info',
    text: `Added mod trip: ${data.trip}, remember to run 'saveconfig' to make it permanent`,
  }, socket);

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `Added mod: ${data.trip}`,
  }, { level: UAC.isModerator });

  return true;
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
