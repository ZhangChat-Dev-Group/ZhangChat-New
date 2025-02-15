/**
  * This object contains Prompt ( https://www.npmjs.com/package/prompt ) style
  * questions that the SetupWizard will require an answer to. Questions are asked
  * in the order they are specified here.
  *
  * The resulting config.json file will be used by the server, accessed by the
  * name specified. IE, a valid use is; config.adminName
  *
  */

const Questions = {
  properties: {
    tripSalt: {
      description: '盐（留空使用默认值）',
      type: 'string',
      hidden: true,
      replace: '*',
      before: (value) => {
        salt = value;
        return value;
      },
    },

    email: {
      description: '电子邮箱',
      type: 'string',
      message: 'MrZhang365：请填好你的电子邮箱 我不想替你背锅（指你的聊天室报错 用户都联系我）'
    },

    adminTrip: {
      type: 'string',
      hidden: true,
      replace: '*',
      description: '站长密码',
      message: '你必须输入密码',
      before: (value) => {
        const crypto = require('crypto');
        
        let sha256 = crypto.createHash('sha256')
        sha256.update(value)
        const password = sha256.digest('hex')

        const sha = crypto.createHash('sha256');
        sha.update(password + salt);
        return sha.digest('base64').substr(0, 6);
      },
    },

    port: {
      type: 'integer',
      message: '端口号必须为整数',
      description: '端口',
      default: '3000',
    },

    ipHeader: {
      type: 'string',
      message: '请输入请求头，留空则直接获取IP',
      description: '从哪个请求头获取IP？（留空则为直接获取）',
      default: '',
      before: value => {
        if (!value) return ''
        return value.toLowerCase()
      }
    }
  },
};

module.exports = Questions;
