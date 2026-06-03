/**
 * 全局 message 实例 holder
 *
 * Ant Design 5.x 的静态方法（message.success 等）无法消费 ConfigProvider 上下文（主题、locale 等）。
 * 解决方案：在 <App>（AntApp）内部通过 App.useApp() 拿到上下文感知的 message 实例，
 * 然后赋值给这个 holder，所有组件统一通过 holder 调用。
 *
 * 使用方式：
 *   1. 在根组件树中挂载 <MessageHolderInit />（放在 <AntApp> 内部）
 *   2. 其他任何地方 import { messageHolder } from '@/utils/messageHolder'
 *   3. 调用 messageHolder.success('...') / messageHolder.error('...')
 */
import type { MessageInstance } from 'antd/es/message/interface'

type MessageContent = string | { content: string; key?: string; duration?: number; [k: string]: any }

let _message: MessageInstance | null = null

function normalizeArgs(content: MessageContent, duration?: number): [string, number, { key?: string }] {
  if (typeof content === 'object') {
    return [content.content, content.duration ?? duration ?? 3, { key: content.key }]
  }
  return [content, duration ?? 3, {}]
}

export const messageHolder = {
  success: (content: MessageContent, duration?: number) => {
    const [c, d, opts] = normalizeArgs(content, duration)
    return _message?.success({ content: c, duration: d, ...opts })
  },
  error: (content: MessageContent, duration?: number) => {
    const [c, d, opts] = normalizeArgs(content, duration)
    return _message?.error({ content: c, duration: d, ...opts })
  },
  warning: (content: MessageContent, duration?: number) => {
    const [c, d, opts] = normalizeArgs(content, duration)
    return _message?.warning({ content: c, duration: d, ...opts })
  },
  info: (content: MessageContent, duration?: number) => {
    const [c, d, opts] = normalizeArgs(content, duration)
    return _message?.info({ content: c, duration: d, ...opts })
  },
  loading: (content: MessageContent, duration?: number) => {
    const [c, d, opts] = normalizeArgs(content, duration)
    return _message?.loading({ content: c, duration: d, ...opts })
  },
  open: (config: Parameters<MessageInstance['open']>[0]) => _message?.open(config),
  destroy: (key?: string) => _message?.destroy(key),
}

export function setMessageInstance(instance: MessageInstance) {
  _message = instance
}
