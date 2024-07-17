# wechat-node

- 在终端上进行微信聊天
- 基于[Wechaty](http://github.com/wechaty/wechaty)开源项目开发。
- node交互进程

## 环境要求
```bash
# configure
1. node version 18+
2. pnpm version 7.x
```


### pnpm 安装
```bash
npm install -g pnpm
```

## 🚀 Development
```bash
# install dependencies
pnpm i

# start the service
pnpm dev

# 
```
## 😇 node交互进程信息通信
1. 第一个服务启动之后，准备启动node交互进程
2. 操作引导
    1. 在src/configs/addressBook.json中设置通讯录，方便后续指定通讯人
    2. 启动node交互进程 pnpm start
    3. 设置发送信息对象，例如在addressBook中数据为 `{"zs": "张三",  "ls": "李四"}`,则输入 `set zs`，当前信息的发送对象就是微信好友中备注叫张三的人
    4. 发送消息，输入 `1 {你想发送的内容}` ，然后回车
    5. 在第一个服务的终端界面可以看到发送到的消息和接受到的消息
`

-  当前可用指令
```
set <name>: 设置发送消息目标
1 <content>: 发送消息
who: 查看当前发送消息目标
help: 可用命令介绍
```


## 🌟 Send Message
window使用如下：
```bash
# 发送好友消息

# 根据好友昵称发送消息
curl http://127.0.0.1:3000/0?name=好友名称'&'content=测试消息
# 根据好友备注发送消息，需要设置好友备注名
curl http://127.0.0.1:3000/0?alias=好友备注'&'content=测试消息
# 发送群消息
curl http://127.0.0.1:3000/1?name=群名称'&'content=测试消息
```

macos使用如下：
```bash
# 发送好友消息

# 根据好友昵称发送消息
curl 'http://127.0.0.1:3000/0?name=好友名称&content=测试消息'
# 根据好友备注发送消息，需要设置好友备注名
curl 'http://127.0.0.1:3000/0?alias=好友备注&content=测试消息'

# 发送群消息
curl 'http://127.0.0.1:3000/1?name=群名称&content=测试消息'
```


