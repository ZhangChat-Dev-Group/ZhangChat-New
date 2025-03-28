import {
  basename,
  join,
  sep,
  dirname,
  relative,
} from 'path';
import didYouMean from 'didyoumean2';
import { isRegExp } from 'util/types';

// default command modules path
const CmdDir = 'src/commands';

/**
  * Commands / protocol manager- loads, validates and handles command execution
  * @property {Array} commands - Array of currently loaded command modules
  * @property {Array} categories - Array of command modules categories
  * @author Marzavec ( https://github.com/marzavec )
  * @version v2.0.0
  * @license WTFPL ( http://www.wtfpl.net/txt/copying/ )
  */
class CommandManager {
  /**
    * Create a `CommandManager` instance for handling commands/protocol
    *
    * @param {Object} core Reference to the global core object
    */
  constructor(core) {
    /**
      * Stored reference to the core
      * @type {CoreApp}
      */
    this.core = core;

    /**
      * Command module storage
      * @type {Array}
      */
    this.commands = [];

    /**
      * Command module category names (based off directory or module meta)
      * @type {Array}
      */
    this.categories = [];
  }

  /**
    * (Re)initializes name spaces for commands and starts load routine
    * @public
    * @return {String} Module errors or empty if none
    */
  loadCommands() {
    this.commands = [];
    this.categories = [];

    const commandImports = this.core.dynamicImports.getImport(CmdDir);
    let cmdErrors = '';
    Object.keys(commandImports).forEach((file) => {
      const command = commandImports[file];
      const name = basename(file);
      cmdErrors += this.validateAndLoad(command, file, name);
    });

    return cmdErrors;
  }

  /**
    * Checks the module after having been `require()`ed in and reports errors
    * @param {Object} command reference to the newly loaded object
    * @param {String} file file path to the module
    * @param {String} name command (`cmd`) name
    * @private
    * @return {String} Module errors or empty if none
    */
  validateAndLoad(command, file, name) {
    const error = this.validateCommand(command);

    if (error) {
      const errText = `无法加载命令：'${name}'：${error}`;
      this.core.logger.error(errText);
      return errText;
    }

    if (this.findBy('id', command.info.id)) {
      const errText = `无法加载命令：'${name}'：重复的ID`
      this.core.logger.error(errText)
      return errText
    }

    if (!command.category) {
      const base = join(this.core.dynamicImports.base, 'commands');

      let category = '未分类';
      if (file.indexOf(sep) > -1) {
        category = dirname(relative(base, file))
          .replace(new RegExp(sep.replace('\\', '\\\\'), 'g'), '/');
      }

      command.info.category = category;

      if (this.categories.indexOf(category) === -1) {
        this.categories.push(category);
      }
    }

    if (typeof command.init === 'function') {
      try {
        command.init(this.core);
      } catch (err) {
        const errText = `无法初始化命令 '${name}'：${err}`;
        this.core.logger.error(errText);
        return errText;
      }
    }

    if (Array.isArray(command.info.permissions)) {
      for (let permission of command.info.permissions) {
        let p = `${command.info.id}.permission.${permission}`
	      if (this.core.permissions.permissions.has(p)) continue
	      this.core.permissions.registerPermission(p)
      }
    }

    if (Array.isArray(command.info.permissionGroups)) {
      for (let group of command.info.permissionGroups) {
        if (this.core.permissions.permissionGroups.has(group)) continue
        this.core.permissions.registerPermissionGroup(group.name, group.permissions, group.include)
      }
    }

    this.commands.push(command);

    return '';
  }

  /**
    * Checks the module after having been `require()`ed in and reports errors
    * @param {Object} object reference to the newly loaded object
    * @private
    * @return {String} Module errors or null if none
    */
  validateCommand(object) {
    if (typeof object !== 'object') { return '命令模块无效'; }
    if (typeof object.run !== 'function') { return '找不到run函数'; }
    if (typeof object.info !== 'object') { return '找不到info对象'; }
    if (typeof object.info.id !== 'string' || !object.info.id) { return 'info对象的id属性错误' }
    if (typeof object.info.name !== 'string' || !object.info.name) { return 'info对象的name属性错误'; }

    if (!Array.isArray(object.info.permissions) && typeof object.info.permissions !== 'undefined') return 'info.permissions 要么没有 要么是数组'
    if (Array.isArray(object.info.permissions)) {
      if (!object.info.permissions.every(p => typeof p === 'string' && !!p)) return 'info.permissions 包含无效的权限名称'
    }

    if (!Array.isArray(object.info.permissionGroups) && typeof object.info.permissionGroups !== 'undefined') return 'info.permissionGroups 要么没有 要么是数组'
    if (Array.isArray(object.info.permissionGroups)) {
      if (!object.info.permissionGroups.every(g => {
        if (typeof g.name !== 'string' || !g.name) return false
        if (!Array.isArray(g.permissions)) return false
        if (!g.permissions.every(p => typeof p === 'string' && !!p)) return false
        if (!g.include.every(p => typeof p === 'string' && !!p)) return false
        return true
      })) {
        const errText = `info.permissionGroups 格式错误`
        return errText
      }
    }

    if (!['object', 'undefined'].includes(typeof object.approve) || object.approve === null) { return 'approve 对象必须是object 或者没有' }    // 我说的是人话吗？
    if (object.approve && !Array.isArray(object.approve.permissions) && typeof object.approve.permissions !== 'undefined') { return 'object.approve.permissions 要么没有 要么就必须是Array' }
    if (object.approve && Array.isArray(object.approve.permissions)) {
      if (!object.approve.permissions.every(p => typeof p === 'string' && !!p)) return 'approve.permissions 格式错误'
    }

    if (object.approve && !Array.isArray(object.approve.groups) && typeof object.approve.groups !== 'undefined') { return 'object.approve.groups 要么没有 要么就必须是Array' }
    if (object.approve && Array.isArray(object.approve.groups)) {
      if (!object.approve.groups.every(p => typeof p === 'string' && !!p)) return 'approve.groups 格式错误'
    }

    return null;
  }

  /**
    * Pulls all command names from a passed `category`
    * @param {String} category [Optional] filter return results by this category
    * @public
    * @return {Array} Array of command modules matching the category
    */
  all(category) {
    return !category ? this.commands : this.commands.filter(
      (c) => c.info.category.toLowerCase() === category.toLowerCase(),
    );
  }

  /**
    * All category names
    * @public
    * @readonly
    * @return {Array} Array of command category names
    */
  get categoriesList() {
    return this.categories;
  }

  /**
    * Pulls command by name or alias
    * @param {String} name name or alias of command
    * @public
    * @return {Object} Target command module object
    */
  get(name) {
    return this.findBy('name', name)
      || this.commands.find(
        (command) => command.info.aliases instanceof Array
        && command.info.aliases.indexOf(name) > -1,
      );
  }

  /**
    * Pulls command by arbitrary search of the `module.info` attribute
    * @param {String} key name or alias of command
    * @param {String} value name or alias of command
    * @public
    * @return {Object} Target command module object
    */
  findBy(key, value) {
    return this.commands.find((c) => c.info[key] === value);
  }

  /**
    * Runs `initHooks` function on any modules that utilize the event
    * @private
    * @param {Object} server main server object
    */
  initCommandHooks(server) {
    this.commands.filter((c) => typeof c.initHooks === 'function').forEach(
      (c) => c.initHooks(server),
    );
  }

  initFakeJavaScript(httpServer) {
    this.commands.filter(c => typeof c.initFjs === 'function').forEach(
      c => c.initFjs(httpServer)
    )
  }

  /**
   * 这个代码来自 https://github.com/ZhangChat-Dev-Group/ZhangChat
   * 等等... 这段代码就是我自己写在旧版ZhangChat里的 所以我copy我自己的代码 应该不用注明来源吧？
   * 
   * 通过命令模块info对象的dataRules属性验证用户输入值是否正确
   * @param {Array} rules 命令模块info对象的dataRules属性
   * @param {Object} data 数据
   * @returns {String|true} 如果是字符串，则代表报错；如果是true，则代表验证成功
   */

  verifyData(rules, data) {
    const missing = []
    let i = 0

    if (typeof data.nick === 'string') {
      var nickArr = data.nick.split('#')
      nickArr[0] = nickArr[0].replace(/@/g, '')
      data.nick = nickArr.join('#')
    }

    for (i in rules) {
      if (typeof data[rules[i].name] === 'undefined' && !rules[i].required) continue
      if (typeof data[rules[i].name] === 'undefined') {
        // 丢了个参数
        missing.push(rules[i].name)
        continue    // 继续执行下一次循环
      }

      if (typeof rules[i].verify === 'function') {
        // 参数验证模式：自定义函数
        // 返回值类型为string则报错，为false返回errorMessage的内容（没有则返回默认报错内容），为true则说明验证通过
        let result = rules[i].verify(data[rules[i].name])

        if (result === true) continue

        return result || rules[i].errorMessage || `错误：参数 ${rules[i].name} 的值有误，请查证后再试`    // 报错

      }else if (isRegExp(rules[i].verify)) {
        // 参数验证模式：正则表达式
        if (!rules[i].verify.test(data[rules[i].name])) {
          // 验证失败
          return rules[i].errorMessage || `错误：参数 ${rules[i].name} 的值有误，请查证后再试`    // 报错
        }
      }
    }

    if (missing.length !== 0) {
      // 如果真的丢失参数，则返回错误信息
      return `错误：您没有提供参数 ${missing.join('、')}`
    }
    return true
  }

  parseText(rules, text) {
    // 这个代码的来源和 verifyData 一样
    // 实例：/color 44FF00

    var data = {}
    var textArray = text.split(' ')

    data.cmd = textArray[0].slice(1)

    for (let i = 0; i < rules.length; i++) {    // Do you know the rules? You know the rules and so do I~
      if (!textArray[i + 1]) {
        return data
      }

      if (rules[i].all) {
        data[rules[i].name] = textArray.slice(i + 1).join(' ')
        return data
      }
      
      data[rules[i].name] = textArray[i + 1]
    }

    return data
  }

  /**
    * Finds and executes the requested command, or fails with semi-intelligent error
    * @param {Object} server main server reference
    * @param {Object} socket calling socket reference
    * @param {Object} data command structure passed by socket (client)
    * @public
    * @return {*} Arbitrary module return data
    */
  handleCommand(server, socket, data) {
    // Try to find command first
    const command = this.get(data.cmd);

    if (command) {
      return this.execute(command, server, socket, data);
    }

    // Then fail with helpful (sorta) message
    return this.handleFail(server, socket, data);
  }

  /**
    * Requested command failure handler, attempts to find command and reports back
    * @param {Object} server main server reference
    * @param {Object} socket calling socket reference
    * @param {Object} data command structure passed by socket (client)
    * @private
    * @return {*} Arbitrary module return data
    */
  handleFail(server, socket, data) {
    const maybe = didYouMean(data.cmd, this.all().map((c) => c.info.name), {
      threshold: 5,
      thresholdType: 'edit-distance',
    });

    if (maybe) {
      return this.core.server.reply({
        cmd: 'warn',
        text: `找不到命令，敢问您指的是这个吗：\`${maybe}\`?`
      }, socket)
    }

    return this.core.server.reply({
      cmd: 'warn',
      text: `找不到命令`
    }, socket)
  }

  /**
    * Attempt to execute the requested command, fail if err or bad params
    * @param {Object} command target command module
    * @param {Object} server main server reference
    * @param {Object} socket calling socket reference
    * @param {Object} data command structure passed by socket (client)
    * @private
    * @return {*} Arbitrary module return data
    */
  async execute(command, server, socket, data) {
    // 适配 PermissionManager API 的鉴权机制
    // 如果命令模块声明了仅批准特定用户执行
    if (typeof command.approve === 'object') {
      let approved = false
      if (Array.isArray(command.approve.permissions)) {
        for (let i of command.approve.permissions) {
          if (this.core.permissions.hasPermission(socket.trip, i)) {
            approved = true
            break
          }
        }
      }
      if (Array.isArray(command.approve.groups) && !approved) {
        for (let i of command.approve.groups) {
          if (this.core.permissions.inPermissionGroup(socket.trip, i)) {
            approved = true
            break
          }
        }
      }
      
      if (!approved) return this.core.server.reply({
        cmd: 'warn',
        text: '抱歉，你没有执行这个命令的权限',
      }, socket)
    }

    if (typeof command.info.rateLimit === 'number') {
      if (server.police.frisk(socket.address, command.info.rateLimit)) return server.reply({
        cmd: 'warn',
        text: '您执行此命令的速度太快，请稍后重试'
      }, socket)
    }

    // 这个来源也一样...
    if (Array.isArray(command.info.dataRules)) {
      // 命令模块要求检查用户输入值是否合法
      const msg = this.verifyData(command.info.dataRules, data)
      if (typeof msg === 'string') {
        this.core.server.reply({
          cmd: 'warn',
          text: msg
        }, socket)

        return null;
      }
    }

    this.core.stats.increment('cmd-executed')
    try {
      await command.run(this.core, server, socket, data);
    } catch (err) {
      const errText = `# : (\n# 非常无语，我们出错了\n## 由于未知原因，我们无法执行 ${command.info.name} 命令\n小张聊天室 2.0 技术尚不成熟，尽管我们竭尽全力地写代码，但出错仍然是在所难免的\n我们恳请您将此错误报告给开发人员，以便于为您提供最好的体验\n联系方式： ${this.core.config.email}\n`;

      // If we have more detail enabled, then we get the trace
      // if it isn't, or the property doesn't exist, then we'll get only the message
      this.core.logger.error(errText + err.stack);
      socket.replyWarn(errText + err.toString())

      return null;
    }
  }
}

export default CommandManager;
