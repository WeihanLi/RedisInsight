import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  aiExpertChatSelector,
  askExpertChatbotAction,
  getExpertChatHistoryAction,
  removeExpertChatHistoryAction,
} from 'uiSrc/slices/panels/aiAssistant'
import { getCommandsFromQuery, isRedisearchAvailable, Nullable, scrollIntoView } from 'uiSrc/utils'
import { connectedInstanceSelector, freeInstancesSelector } from 'uiSrc/slices/instances/instances'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { fetchRedisearchListAction } from 'uiSrc/slices/browser/redisearch'
import NoIndexesInitialMessage from './components/no-indexes-initial-message'
import ExpertChatHeader from './components/expert-chat-header'
import { ChatForm, ChatHistory, ExpertChatInitialMessage } from '../shared'

import styles from './styles.module.scss'

const ExpertChat = () => {
  const { messages, loading } = useSelector(aiExpertChatSelector)
  const { name: connectedInstanceName, modules, provider } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const freeInstances = useSelector(freeInstancesSelector) || []

  const [isNoIndexes, setIsNoIndexes] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inProgressMessage, setinProgressMessage] = useState<Nullable<AiChatMessage>>(null)

  const currentAccountIdRef = useRef(userOAuthProfile?.id)
  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)
  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!instanceId) {
      return
    }

    // changed account
    if (currentAccountIdRef.current !== userOAuthProfile?.id) {
      currentAccountIdRef.current = userOAuthProfile?.id
      dispatch(getExpertChatHistoryAction(instanceId, () => scrollToBottom('auto')))
      return
    }

    if (messages.length) {
      scrollToBottom('auto')
      return
    }

    dispatch(getExpertChatHistoryAction(instanceId, () => scrollToBottom('auto')))
  }, [instanceId, userOAuthProfile])

  useEffect(() => {
    if (!instanceId) return
    if (!isRedisearchAvailable(modules)) return
    if (messages.length) return

    getIndexes()
  }, [instanceId, modules])

  const getIndexes = () => {
    setIsLoading(true)
    dispatch(
      fetchRedisearchListAction(
        (indexes) => {
          setIsLoading(false)
          setIsNoIndexes(!indexes.length)
        },
        () => setIsLoading(false),
        false
      )
    )
  }

  const handleSubmit = useCallback((message: string) => {
    scrollToBottom()

    dispatch(askExpertChatbotAction(
      instanceId,
      message,
      {
        onMessage: (message: AiChatMessage) => {
          setinProgressMessage({ ...message })
          scrollToBottom('auto')
        },
        onError: (errorCode: number) => {
          sendEventTelemetry({
            event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
            eventData: {
              chat: AiChatType.Query,
              errorCode
            }
          })
        },
        onFinish: () => setinProgressMessage(null)
      }
    ))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chat: AiChatType.Query
      }
    })
  }, [instanceId])

  const onRunCommand = useCallback((query: string) => {
    const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
      eventData: {
        databaseId: instanceId,
        chat: AiChatType.Query,
        provider,
        command
      }
    })
  }, [instanceId, provider])

  const onClearSession = useCallback(() => {
    dispatch(removeExpertChatHistoryAction(instanceId))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.Query
      }
    })
  }, [])

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior,
        block: 'start',
        inline: 'start',
      })
    }, 0)
  }

  const getValidationMessage = () => {
    if (!instanceId) {
      return {
        title: 'Open a database',
        content: 'Open your Redis database with search & query, or create a new database to get started.'
      }
    }

    if (!isRedisearchAvailable(modules)) {
      return {
        title: 'Search & query capability is not available',
        content: freeInstances?.length
          ? 'Use your free all-in-one Redis Cloud database to start exploring these capabilities.'
          : 'Create a free Redis Stack database with search & query capability that extends the core capabilities of open-source Redis.'
      }
    }

    return undefined
  }

  return (
    <div className={styles.wrapper} data-testid="ai-document-chat">
      <ExpertChatHeader
        connectedInstanceName={connectedInstanceName}
        databaseId={instanceId}
        isClearDisabled={!messages?.length || !instanceId}
        onRestart={onClearSession}
      />
      <div className={styles.chatHistory}>
        <ChatHistory
          isLoading={loading || isLoading}
          modules={modules}
          initialMessage={isNoIndexes
            ? <NoIndexesInitialMessage onSuccess={getIndexes} />
            : ExpertChatInitialMessage}
          inProgressMessage={inProgressMessage}
          history={messages}
          scrollDivRef={scrollDivRef}
          onRunCommand={onRunCommand}
          onRestart={onClearSession}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          isDisabled={!instanceId || !!inProgressMessage}
          validation={getValidationMessage()}
          placeholder="Ask me to query your data (e.g. How many road bikes?)"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default ExpertChat
