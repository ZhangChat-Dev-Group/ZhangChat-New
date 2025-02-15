/**
  * This script will be run before the package starts asking for the config data,
  * used to output a simple guide for the coming questions, or to spam some sexy
  * ascii art at the user.
  *
  */

import { stripIndents } from 'common-tags';
import chalk from 'chalk';

// gotta have that sexy console
console.log(stripIndents`
  ${chalk.magenta('°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø')}
  ${chalk.gray('--------------(') + chalk.white(' 小张聊天室配置工具 2.0 ') + chalk.gray(')--------------')}
  ${chalk.magenta('°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø')}

  ${chalk.white('注意：')} ${chalk.green('npm/yarn run config')} 将会重新运行本工具

  请提供以下内容
  -  ${chalk.magenta('        盐')}，用于生成识别码的盐值
  -  ${chalk.magenta('   电子邮箱')}，用于向用户展示的邮箱地址
  -  ${chalk.magenta('   站长密码')}，使用该密码登录即可取得所有权限
  -  ${chalk.magenta('       端口')}，服务器端口
  -  ${chalk.magenta('  获取IP方式')}，是否从XFF请求头获取IP
  \u200b
`);
