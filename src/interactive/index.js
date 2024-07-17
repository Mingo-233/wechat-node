// const readline = require('node:readline')
// const process = require('node:process')
// const axios = require('axios')
import readline from 'node:readline'
import process from 'node:process'
import axios from 'axios'
import addressBook from '../configs/addressBook.json' assert { type: 'json' }

const baseUrl = 'http://127.0.0.1:3000'

// curl 'http://127.0.0.1:3000/0?alias=好友备注&content=测试消息'
// 创建接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// 存储变量的对象
const variablesMap = {
  receiver: '',
}

async function sendAlias(alias, content) {
  try {
    const response = await axios.get(`${baseUrl}/0`, {
      params: {
        alias, content,
      },
    })
    // const response = await axios.get(`${baseUrl}/test`, {
    //   params: {
    //     alias, content,
    //   },
    // })

    console.log('响应数据:', response.data)
  }
  catch (error) {
    console.error('请求失败:', error)
  }
}

// 处理命令
async function handleCommand(command) {
  const parts = command.trim().split(' ')
  const action = parts[0]

  switch (action) {
    case 'set':
      if (parts.length < 2) {
        console.log('用法: set <name> ')
      }
      else {
        const [_, name] = parts
        if (addressBook[name]) {
          variablesMap.receiver = addressBook[name]
          console.log(`已设置发送消息目标为通讯录目标: ${variablesMap.receiver}`)
          return
        }

        variablesMap.receiver = name
        console.log(`已设置发送消息目标为: ${variablesMap.receiver}`)
      }
      break

    case '1':
      if (parts.length < 1) {
        console.log('用法: send <target> [content...]')
      }
      else {
        const target = variablesMap.receiver || parts[1]
        const content = variablesMap.receiver ? parts[1] : parts[2]
        await sendAlias(target, content)
      }
      break
    case 'who':
      console.log('当前发送消息目标:', variablesMap.receiver)
      break
    case 'help':
      console.log('可用命令:')
      console.log('set <name>: 设置发送消息目标')
      console.log('1 <content>: 发送消息')
      console.log('who: 查看当前发送消息目标')
      break
    default:
      console.log('未知命令, 输入 help 查看可用命令.')
  }
}
// 监听命令行输入
rl.on('line', (input) => {
  handleCommand(input)
})
console.log('通信工具已启用.')
