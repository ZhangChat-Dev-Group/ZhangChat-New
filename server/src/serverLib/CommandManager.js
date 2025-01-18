import {
  basename,
  join,
  sep,
  dirname,
  relative,
} from 'path';
import didYouMean from 'didyoumean2';

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

    /**
      * Full path to config.json file
      * @type {String}
      */
    if (typeof this.core.config.logErrDetailed === 'undefined') {
      this.core.config.logErrDetailed = false;
    }
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
      const errText = `Failed to load command module '${name}': ${error}`;
      console.log(errText);
      return errText;
    }

    if (this.findBy('id', command.info.id)) {
      const errText = `Failed to load '${name}': 重复的ID`
      console.log(errText)
      return errText
    }

    if (!command.category) {
      const base = join(this.core.dynamicImports.base, 'commands');

      let category = 'Uncategorized';
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
        const errText = `Failed to initialize '${name}': ${err}`;
        console.log(errText);
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
    if (typeof object !== 'object') { return 'command setup is invalid'; }
    if (typeof object.run !== 'function') { return 'run function is missing'; }
    if (typeof object.info !== 'object') { return 'info object is missing'; }
    if (typeof object.info.id !== 'string' || !object.info.id) { return 'info object is missing a valid id field' }
    if (typeof object.info.name !== 'string' || !object.info.name) { return 'info object is missing a valid name field'; }

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
        console.log(errText)
        return errText
      }
    }

    if (!['object', 'undefined'].includes(typeof object.approve) || object.approve === null) { return 'approve 对象必须是object 或者没有' }    // 我说的是人话吗？
    if (!Array.isArray(object.approve.permissions) && typeof object.approve.permissions !== 'undefined') { return 'object.approve.permissions 要么没有 要么就必须是Array' }
    if (Array.isArray(object.approve.permissions)) {
      if (!object.approve.permissions.every(p => typeof p === 'string' && !!p)) return 'approve.permissions 格式错误'
    }

    if (!Array.isArray(object.approve.groups) && typeof object.approve.groups !== 'undefined') { return 'object.approve.groups 要么没有 要么就必须是Array' }
    if (Array.isArray(object.approve.groups)) {
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
    this.commands.filter((c) => typeof c.initHooks !== 'undefined').forEach(
      (c) => c.initHooks(server),
    );
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
      // Found a suggestion, pass it on to their dyslexic self
      return this.handleCommand(server, socket, {
        cmd: 'socketreply',
        cmdKey: server.cmdKey,
        text: `Command not found, did you mean: \`${maybe}\`?`,
      });
    }

    // Request so mangled that I don't even. . .
    return this.handleCommand(server, socket, {
      cmd: 'socketreply',
      cmdKey: server.cmdKey,
      text: 'Unknown command',
    });
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
        text: 'Sorry, but 403 Forbidden.',
      }, socket)
    }
    if (typeof command.requiredData !== 'undefined') {
      const missing = [];
      for (let i = 0, len = command.requiredData.length; i < len; i += 1) {
        if (typeof data[command.requiredData[i]] === 'undefined') { missing.push(command.requiredData[i]); }
      }

      if (missing.length > 0) {
        console.log(`Failed to execute '${
          command.info.name
        }': missing required ${missing.join(', ')}\n\n`);

        this.handleCommand(server, socket, {
          cmd: 'socketreply',
          cmdKey: server.cmdKey,
          text: `Failed to execute '${
            command.info.name
          }': missing required ${missing.join(', ')}\n\n`,
        });

        return null;
      }
    }

    try {
      return await command.run(this.core, server, socket, data);
    } catch (err) {
      const errText = `Failed to execute '${command.info.name}': `;

      // If we have more detail enabled, then we get the trace
      // if it isn't, or the property doesn't exist, then we'll get only the message
      if (this.core.config.logErrDetailed === true) {
        console.log(errText + err.stack);
      } else {
        console.log(errText + err.toString());
      }

      this.handleCommand(server, socket, {
        cmd: 'socketreply',
        cmdKey: server.cmdKey,
        text: errText + err.toString(),
      });

      return null;
    }
  }
}

export default CommandManager;
