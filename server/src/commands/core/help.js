/*
  Description: Outputs the current command module list or command categories
*/

// module main
export async function run(core, server, socket, payload) {
  let reply = '';
  if (typeof payload.command === 'undefined') {
    reply += '# 全部命令\n|分类|名称|\n|---:|---|\n';

    const categories = core.commands.categoriesList.sort();
    for (let i = 0, j = categories.length; i < j; i += 1) {
      reply += `|${categories[i].replace('../src/commands/', '').replace(/^\w/, (c) => c.toUpperCase())}:|`;
      const catCommands = core.commands.all(categories[i]).sort((a, b) => a.info.name.localeCompare(b.info.name));
      reply += `${catCommands.map((c) => `${c.info.name}`).join(', ')}|\n`;
    }

    reply += '---\n若要获取指定命令的帮助，请使用：\n发送：`/help <命令名>`\nAPI：`{cmd: \'help\', command: \'<command name>\'}`';
  } else {
    const command = core.commands.get(payload.command);

    if (typeof command === 'undefined') {
      reply += '找不到命令';
    } else {
      reply += `# ${command.info.name} 命令：\n| | |\n|---:|---|\n`;
      reply += `|**名称：**|${command.info.name}|\n`;
      reply += `|**别名：**|${typeof command.info.aliases !== 'undefined' ? command.info.aliases.join(', ') : '¯\\\_(ツ)_/¯'}|\n`;
      reply += `|**分类：**|${command.info.category.replace('../src/commands/', '').replace(/^\w/, (c) => c.toUpperCase())}|\n`;
      reply += `|**必要参数：**|${command.info.dataRules.filter(r => r.required).map(r => r.name).join(', ') || '¯\\\_(ツ)_/¯'}|\n`;
      reply += `|**说明：**|${command.info.description || '¯\\\_(ツ)_/¯'}|\n\n`;
      reply += `**用法：** ${command.info.usage || command.info.name}`;
    }
  }

  // output reply
  server.reply({
    cmd: 'info',
    text: reply,
  }, socket);

  return true;
}

export const info = {
  id: 'root.hackchat.help',
  rateLimit: 3,
  name: 'help',
  aliases: ['h', '?'],
  description: 'Outputs information about the servers current protocol',
  usage: `
    API: { cmd: 'help', command: '<optional command name>' }
    发送 /help <命令名称（可不填）>`,
  runByChat: true,
  dataRules: [{
    name: 'command',
    required: false
  }]
};
