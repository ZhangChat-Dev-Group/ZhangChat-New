# 小张聊天室 全新版本  

## ~~成品~~  
尚未完工，敬请期待  
~~https://nzhc.zhangsoft.link/~~  

## 简介  
**注意：此项目尚未完工，可能会出现各种不可预知的错误，请酌情使用**  
这是一个黑客风格的匿名聊天室，基于开源项目 HackChat 的一个旧版本编写。  
里面的所有功能都是以“命令”的形式存在。  
对比旧版本的 ZhangChat，此版本会简洁一些。  

## 未完成的事项  
[ ] 汉化  
[ ] 精修 PermissionManager.js 代码和注释  
[ ] 更新内置命令  
[ ] 完善权限机制

## 重要内容  
### 关于许可证和开源的问题  
我们的软件是开源的，但这并不代表您可以不遵守许可证要求而干任何事情。开源是一种精神，但许可证是底线，以开源的名义而不遵守许可证的不良开发者，是无法成大器的。这里引用ice（light）的一句话：“你应该尊重开发者！”  

## 安装和部署  
### 先决条件  
- Node.JS 10.15.1 或更高版本  
- NPM 6.7.0 或更高版本  

### 部署  
**注意：项目尚未完工 部署方式可能有不正确的地方**  
1.  克隆此仓库  
2.  在仓库根目录下执行 npm install  
3.  按照向导的提示配置服务器  
4.  修改 client/client.js 的join函数，把与URL相关的代码按照实际情况进行修改
5.  执行 npm start（请注意防火墙放行相关端口）  

## 开发背景  
> 这个聊天室原本是[MelonFish](https://gitee.com/XChatFish)交给[MrZhang365](https://blog.mrzhang365.cf)开发的XChat聊天室。  
> 但是由于某些原因，它被开发者魔改成了旧版的小张聊天室。  
> 2024年9月17日凌晨，MrZhang365经过深思熟虑，决定重写小张聊天室，故出现此项目。  

XChat基于HackChat，HackChat的GitHub仓库地址为：https://github.com/hack-chat/main  
旧版小张聊天室的仓库地址为：https://github.com/ZhangChat-Dev-Group/ZhangChat

## 贡献者  
- [HackChat](https://github.com/Hack-Chat) 编写底层代码  
- [MrZhang365](https://blog.mrzhang365.cf) 汉化前端与后端，并编写了许多新功能  