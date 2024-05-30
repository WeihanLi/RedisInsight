import {
  EuiPage,
  EuiPageBody,
  EuiResizableContainer,
  EuiResizeObserver
} from '@elastic/eui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { throttle } from 'lodash'
import DatabasePanel from 'uiSrc/pages/home/components/database-panel'
import { clusterSelector, resetDataRedisCluster, resetInstancesRedisCluster, } from 'uiSrc/slices/instances/cluster'
import { Nullable, setTitle } from 'uiSrc/utils'
import { PageHeader } from 'uiSrc/components'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import { BrowserStorageItem, FeatureFlags } from 'uiSrc/constants'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import { resetCliHelperSettings, resetCliSettingsAction } from 'uiSrc/slices/cli/cli-settings'
import { resetRedisearchKeysData } from 'uiSrc/slices/browser/redisearch'
import { appContextSelector, setAppContextInitialState } from 'uiSrc/slices/app/context'
import { Instance } from 'uiSrc/slices/interfaces'
import { cloudSelector, resetSubscriptionsRedisCloud } from 'uiSrc/slices/instances/cloud'
import {
  editedInstanceSelector,
  fetchEditedInstanceAction,
  fetchInstancesAction,
  instancesSelector,
  setEditedInstance
} from 'uiSrc/slices/instances/instances'
import { localStorageService } from 'uiSrc/services'
import { resetDataSentinel, sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { fetchContentAction as fetchCreateRedisButtonsAction } from 'uiSrc/slices/content/create-redis-buttons'
import { sendEventTelemetry, sendPageViewTelemetry, TelemetryEvent, TelemetryPageView } from 'uiSrc/telemetry'
import { appRedirectionSelector, setUrlHandlingInitialState } from 'uiSrc/slices/app/url-handling'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { AddDbType } from 'uiSrc/pages/home/constants'

import HighlightedFeature from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import { appFeatureFlagsFeaturesSelector, appFeatureHighlightingSelector } from 'uiSrc/slices/app/features'
import { getHighlightingFeatures, isAnyFeatureEnabled } from 'uiSrc/utils/features'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import AiChatbotMessage from 'uiSrc/components/hightlighted-feature/components/ai-chatbot-message'

import DatabasesList from './components/databases-list-component'
import WelcomeComponent from './components/welcome-component'
import HomeHeader from './components/home-header'
import { CapabilityPromotion } from './components/capability-promotion'

import './styles.scss'
import styles from './styles.module.scss'

enum RightPanelName {
  AddDatabase = 'add',
  EditDatabase = 'edit'
}

const HomePage = () => {
  const [width, setWidth] = useState(0)
  const [openRightPanel, setOpenRightPanel] = useState<Nullable<RightPanelName>>(null)
  const [welcomeIsShow, setWelcomeIsShow] = useState(
    !localStorageService.get(BrowserStorageItem.instancesCount)
  )
  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const initialDbTypeRef = useRef<AddDbType>(AddDbType.manual)

  const dispatch = useDispatch()

  const { credentials: clusterCredentials } = useSelector(clusterSelector)
  const { credentials: cloudCredentials } = useSelector(cloudSelector)
  const { instance: sentinelInstance } = useSelector(sentinelSelector)
  const { action, dbConnection } = useSelector(appRedirectionSelector)

  const { features } = useSelector(appFeatureHighlightingSelector)
  const { aiChatbot: aiChatbotHighlighting } = getHighlightingFeatures(features)
  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([databaseChatFeature, documentationChatFeature])

  const {
    loading,
    data: instances,
    changedSuccessfully: isChangedInstance,
    deletedSuccessfully: isDeletedInstance,
  } = useSelector(instancesSelector)

  const {
    data: editedInstance,
  } = useSelector(editedInstanceSelector)

  const { contextInstanceId } = useSelector(appContextSelector)

  !welcomeIsShow && setTitle('My Redis databases')

  useEffect(() => {
    dispatch(fetchInstancesAction())
    dispatch(resetInstancesRedisCluster())
    dispatch(resetSubscriptionsRedisCloud())
    dispatch(fetchCreateRedisButtonsAction())

    return (() => {
      dispatch(setEditedInstance(null))
    })
  }, [])

  useEffect(() => {
    if (isDeletedInstance) {
      dispatch(fetchInstancesAction())
    }
  }, [isDeletedInstance])

  useEffect(() => {
    if (isChangedInstance) {
      setOpenRightPanel(null)
      dispatch(setEditedInstance(null))
      // send page view after adding database from welcome page
      sendPageViewTelemetry({
        name: TelemetryPageView.DATABASES_LIST_PAGE
      })
    }
  }, [isChangedInstance])

  useEffect(() => {
    if (!isPageViewSent && !isChangedInstance && instances.length) {
      setIsPageViewSent(true)
      sendPageViewTelemetry({
        name: TelemetryPageView.DATABASES_LIST_PAGE
      })
    }
  }, [instances, isPageViewSent, isChangedInstance])

  useEffect(() => {
    if (clusterCredentials || cloudCredentials || sentinelInstance) {
      setOpenRightPanel(RightPanelName.AddDatabase)
    }
  }, [clusterCredentials, cloudCredentials, sentinelInstance])

  useEffect(() => {
    if (action === UrlHandlingActions.Connect) {
      setOpenRightPanel(RightPanelName.AddDatabase)
    }
  }, [action, dbConnection])

  useEffect(() => {
    const instancesCashCount = JSON.parse(
      localStorageService.get(BrowserStorageItem.instancesCount) ?? '0'
    )

    const isShowWelcome = !instances.length && !openRightPanel && !instancesCashCount

    setWelcomeIsShow(isShowWelcome)
  }, [openRightPanel, instances, loading])

  useEffect(() => {
    if (editedInstance) {
      const found = instances.find((item: Instance) => item.id === editedInstance.id)
      if (found) {
        dispatch(fetchEditedInstanceAction(found))
      }
    }
  }, [instances])

  const onDbEdited = () => {
    if (contextInstanceId && contextInstanceId === editedInstance?.id) {
      dispatch(resetKeys())
      dispatch(resetRedisearchKeysData())
      dispatch(resetCliSettingsAction())
      dispatch(resetCliHelperSettings())
      dispatch(setAppContextInitialState())
    }
  }

  const closeEditDialog = () => {
    dispatch(setEditedInstance(null))
    setOpenRightPanel(null)

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CANCELLED_CLICKED,
      eventData: {
        databaseId: editedInstance?.id
      }
    })
  }

  const handleClose = () => {
    dispatch(resetDataRedisCluster())
    dispatch(resetDataSentinel())

    setOpenRightPanel(null)
    dispatch(setEditedInstance(null))

    if (action === UrlHandlingActions.Connect) {
      dispatch(setUrlHandlingInitialState())
    }

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_ADD_FORM_DISMISSED
    })
  }

  const handleAddInstance = (addDbType = AddDbType.manual) => {
    initialDbTypeRef.current = addDbType
    setOpenRightPanel(RightPanelName.AddDatabase)
    dispatch(setEditedInstance(null))
  }

  const handleEditInstance = (editedInstance: Instance) => {
    if (editedInstance) {
      dispatch(fetchEditedInstanceAction(editedInstance))
      setOpenRightPanel(RightPanelName.EditDatabase)
    }
  }
  const handleDeleteInstances = (instances: Instance[]) => {
    if (
      instances.find((instance) => instance.id === editedInstance?.id)
      && openRightPanel === RightPanelName.EditDatabase
    ) {
      dispatch(setEditedInstance(null))
      setOpenRightPanel(null)
    }

    instances.forEach((instance) => {
      localStorageService.remove(BrowserStorageItem.dbConfig + instance.id)
    })
  }

  const onResize = ({ width: innerWidth }: { width: number }) => {
    setWidth(innerWidth)
  }
  const onResizeTrottled = useCallback(throttle(onResize, 100), [])

  if (welcomeIsShow) {
    return (
      <WelcomeComponent onAddInstance={handleAddInstance} />
    )
  }

  return (
    <>
      <HighlightedFeature
        isHighlight={isAnyChatAvailable && aiChatbotHighlighting}
        {...(BUILD_FEATURES.aiChatbot || {})}
      >
        <AiChatbotMessage />
      </HighlightedFeature>
      <PageHeader
        title="My Redis databases"
        className={styles.pageHeader}
        showInsights
      >
        <CapabilityPromotion wrapperClassName={cx(styles.section, styles.capabilityPromotion)} />
      </PageHeader>
      <div className={styles.pageWrapper}>
        <ExplorePanelTemplate panelClassName={styles.explorePanel}>
          <EuiResizeObserver onResize={onResizeTrottled}>
            {(resizeRef) => (
              <EuiPage className={styles.page}>
                <EuiPageBody component="div">
                  <HomeHeader
                    key="instance-controls"
                    onAddInstance={handleAddInstance}
                    direction="row"
                  />
                  <div key="homePage" className="homePage">
                    <EuiResizableContainer style={{ height: '100%' }}>
                      {(EuiResizablePanel, EuiResizableButton) => (
                        <>
                          <EuiResizablePanel
                            scrollable={false}
                            initialSize={62}
                            id="databases"
                            minSize="50%"
                            paddingSize="none"
                            wrapperProps={{
                              className: cx('home__resizePanelLeft', {
                                hidden: !instances.length && !loading,
                                fullWidth: !openRightPanel,
                                openedRightPanel: !!openRightPanel,
                              })
                            }}
                          >
                            <div ref={resizeRef} style={{ height: '100%' }}>
                              {(!!instances.length || loading) && (
                                <DatabasesList
                                  width={width}
                                  editedInstance={editedInstance}
                                  onEditInstance={handleEditInstance}
                                  onDeleteInstances={handleDeleteInstances}
                                />
                              )}
                            </div>
                          </EuiResizablePanel>

                          <EuiResizableButton
                            className={cx('home__resizableButton', {
                              hidden: !openRightPanel || !instances.length,
                            })}
                            style={{ margin: 0 }}
                          />

                          <EuiResizablePanel
                            scrollable={false}
                            initialSize={38}
                            wrapperProps={{
                              className: cx('home__resizePanelRight', {
                                hidden: !openRightPanel,
                                fullWidth: !instances.length,
                              })
                            }}
                            id="form"
                            paddingSize="none"
                            style={{ minWidth: '474px' }}
                          >
                            {!!openRightPanel && (
                              <DatabasePanel
                                editMode={openRightPanel === RightPanelName.EditDatabase}
                                width={width}
                                isResizablePanel
                                urlHandlingAction={action}
                                initialValues={dbConnection ?? null}
                                editedInstance={
                                  openRightPanel === RightPanelName.EditDatabase
                                    ? editedInstance
                                    : sentinelInstance ?? null
                                }
                                onClose={
                                  openRightPanel === RightPanelName.EditDatabase
                                    ? closeEditDialog
                                    : handleClose
                                }
                                onDbEdited={onDbEdited}
                                isFullWidth={!instances.length}
                                initConnectionType={initialDbTypeRef.current}
                              />
                            )}
                            <div id="footerDatabaseForm" />
                          </EuiResizablePanel>
                        </>
                      )}
                    </EuiResizableContainer>
                  </div>
                </EuiPageBody>
              </EuiPage>
            )}
          </EuiResizeObserver>
        </ExplorePanelTemplate>
      </div>
    </>
  )
}

export default HomePage
