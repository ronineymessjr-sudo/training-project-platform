import { App as AntApp } from 'antd'
import { useEffect } from 'react'
import { setMessageInstance } from '../../utils/messageHolder'

/**
 * 挂载在 <AntApp> 内部，将上下文感知的 message 实例注入到 messageHolder 中。
 * 这样所有组件都可以通过 messageHolder 使用带主题上下文的 message。
 */
export default function MessageHolderInit() {
  const { message: contextMessage } = AntApp.useApp()

  useEffect(() => {
    setMessageInstance(contextMessage)
  }, [contextMessage])

  return null
}
