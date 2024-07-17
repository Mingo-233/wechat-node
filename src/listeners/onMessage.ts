import { PassThrough } from 'node:stream'
import fs, { createReadStream, createWriteStream, unlink } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { log } from 'wechaty'
import Ffmpeg from 'fluent-ffmpeg'
import type { Message, Room } from 'wechaty'
import { robotConfig } from '../configs/robot.ts'
import { asr } from '../utils/asr.ts'

const startTime = new Date()
export async function onMessage(msg: Message) {
  // 屏蔽接收历史消息
  if (msg.date() < startTime)
    return

  const room = msg.room()
  if (room) {
    const topic = await room.topic()
    // 群白名单，只接受白名单内的群消息
    if (!robotConfig.whiteRoomList.includes(topic))
      return

    // 群消息
    getMessagePayload(msg, room)
  }
  else {
    const bot = msg.wechaty
    const contact = msg.talker()
    if (contact.type() === bot.Contact.Type.Official || contact.id === 'weixin')
      return

    // 私聊信息
    getMessagePayload(msg)
  }
}
function generateLog(val) {
  fs.writeFileSync('log.json', JSON.stringify(val))
}
function getMessagePayload(msg: Message, room?: Room) {
  const bot = msg.wechaty
  console.log('msg', msg)
  generateLog(msg)
  switch (msg.type()) {
    case bot.Message.Type.Text: {
      room ? dispatchRoomTextMsg(msg, room) : dispatchFriendTextMsg(msg)
      break
    }
    case bot.Message.Type.Attachment:
    case bot.Message.Type.Audio: {
      room ? dispatchRoomAudioMsg(msg, room) : dispatchFriendAudioMsg(msg)
      break
    }
    case bot.Message.Type.Video: {
      room ? dispatchRoomVideoMsg(msg, room) : dispatchFriendVideoMsg(msg)
      break
    }
    case bot.Message.Type.Emoticon: {
      room ? dispatchRoomEmoticonMsg(msg, room) : dispatchFriendEmoticonMsg(msg)
      break
    }
    case bot.Message.Type.Image: {
      room ? dispatchRoomImageMsg(msg, room) : dispatchFriendImageMsg(msg)
      break
    }
    case bot.Message.Type.Url: {
      room ? dispatchRoomUrlMsg(msg, room) : dispatchFriendUrlMsg(msg)
      break
    }
    case bot.Message.Type.MiniProgram: {
      room ? dispatchRoomMiniProgramMsg(msg, room) : dispatchFriendMiniProgramMsg(msg)
      break
    }
    default:
      log.info('接收到莫名其妙的消息')
      break
  }
}

/**
 * 群文本消息
 * @param msg
 * @param room
 */
async function dispatchRoomTextMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const content = msg.text().trim()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了：${content}`)
}

/**
 * 好友文本消息
 * @param msg
 */
async function dispatchFriendTextMsg(msg: Message) {
  const content = msg.text().trim()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了：${content}`)
}

async function dispatchRoomAudioMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了文件`)
}

async function dispatchFriendAudioMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  const msgFile = await msg.toFileBox()
  const filename = msgFile.name
  await msgFile.toFile(filename)
  const mp3Stream = createReadStream(filename)
  const wavStream = new PassThrough()

  Ffmpeg(mp3Stream)
    .fromFormat('mp3')
    .toFormat('wav')
    .pipe(wavStream as any)
    .on('error', (err: Error /* , stdout, stderr */) => {
      log.error(`Cannot process video: ${err.message}`)
    })

  // 将二进制流写入文件
  const filePath = `${filename.split('.')[0]}.wav`
  const fileWriteStream = createWriteStream(filePath)

  wavStream.pipe(fileWriteStream)

  fileWriteStream.on('finish', async () => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    // 获取当前文件所在目录的绝对路径
    const currentPath = path.resolve(__dirname)
    // 返回上两级文件夹的路径
    const oldPath = path.join(currentPath, `../../${filename}`)
    const newPath = path.join(currentPath, `../../${filePath}`)
    const text = await asr(newPath)
    log.info(`好友【${name}】 发送了语音：${text}`)
    unlink(newPath, () => { })
    unlink(oldPath, () => { })
  })
}

async function dispatchRoomVideoMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了视频文件`)
}

async function dispatchFriendVideoMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了视频文件`)
}

async function dispatchRoomEmoticonMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了表情符号`)
}

async function dispatchFriendEmoticonMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了表情符号`)
}

async function dispatchRoomImageMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了图片`)
}

async function dispatchFriendImageMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了图片`)
}

async function dispatchRoomUrlMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了链接`)
}

async function dispatchFriendUrlMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了链接`)
}

async function dispatchRoomMiniProgramMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了小程序`)
}

async function dispatchFriendMiniProgramMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了小程序`)
}
