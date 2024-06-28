import { isEmpty } from 'lodash'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiText } from '@elastic/eui'

import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { getPipelineStatusAction, rdiPipelineStatusSelector } from 'uiSrc/slices/rdi/pipeline'
import { fetchRdiStatistics, rdiStatisticsSelector } from 'uiSrc/slices/rdi/statistics'
import { TelemetryEvent, TelemetryPageView, sendEventTelemetry, sendPageViewTelemetry } from 'uiSrc/telemetry'
import RdiInstancePageTemplate from 'uiSrc/templates/rdi-instance-page-template'
import { formatLongName, Nullable, setTitle } from 'uiSrc/utils'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { PageNames } from 'uiSrc/constants'
import { IPipelineStatus } from 'uiSrc/slices/interfaces'
import Clients from './clients'
import DataStreams from './data-streams'
import Empty from './empty'
import ProcessingPerformance from './processing-performance'
import Status from './status'
import TargetConnections from './target-connections'

import styles from './styles.module.scss'

const isPipelineDeployed = (data: Nullable<IPipelineStatus>) => {
  if (!data) {
    return false
  }

  return !isEmpty(data.pipelines)
}

const StatisticsPage = () => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const { loading: isStatisticsLoading, results: statisticsResults } = useSelector(rdiStatisticsSelector)
  const { name: connectedRdiInstanceName } = useSelector(connectedInstanceSelector)
  const { data: statusData } = useSelector(rdiPipelineStatusSelector)
  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(`${rdiInstanceName} - Pipeline Status`)

  const onRefresh = (section: string) => {
    dispatch(fetchRdiStatistics(rdiInstanceId, section))
  }

  const onRefreshClicked = (section: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId,
        section
      }
    })
  }

  const onChangeAutoRefresh = (section: string, enableAutoRefresh: boolean, refreshRate: string) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED
        : TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId,
        section,
        enableAutoRefresh,
        refreshRate
      }
    })
  }

  useEffect(() => {
    dispatch(getPipelineStatusAction(rdiInstanceId))
    dispatch(fetchRdiStatistics(rdiInstanceId))

    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_STATUS
    })
  }, [])

  useEffect(() => () => {
    // unmount
    dispatch(setLastPageContext(PageNames.rdiStatistics))
  }, [])

  if (!statisticsResults) {
    return null
  }

  // todo add interface
  if (statisticsResults.status === 'failed') {
    return <EuiText style={{ margin: '20px auto' }}>Unexpected error in your RDI endpoint, please refresh the page</EuiText>
  }

  const { data: statisticsData } = statisticsResults

  return (
    <RdiInstancePageTemplate>
      <div className={styles.pageContainer}>
        <div className={styles.bodyContainer}>
          {!isPipelineDeployed(statusData) ? (
            // TODO add loader
            <Empty rdiInstanceId={rdiInstanceId} />
          ) : (
            <>
              <Status data={statisticsData.rdiPipelineStatus} />
              <ProcessingPerformance
                data={statisticsData.processingPerformance}
                loading={isStatisticsLoading}
                onRefresh={() => onRefresh('processing_performance')}
                onRefreshClicked={() => onRefreshClicked('processing_performance')}
                onChangeAutoRefresh={(enableAutoRefresh: boolean, refreshRate: string) =>
                  onChangeAutoRefresh('processing_performance', enableAutoRefresh, refreshRate)}
              />
              <TargetConnections data={statisticsData.connections} />
              <DataStreams
                data={statisticsData.dataStreams}
                loading={isStatisticsLoading}
                onRefresh={() => {
                  dispatch(fetchRdiStatistics(rdiInstanceId, 'data_streams'))
                }}
                onRefreshClicked={() => onRefreshClicked('data_streams')}
                onChangeAutoRefresh={(enableAutoRefresh: boolean, refreshRate: string) =>
                  onChangeAutoRefresh('data_streams', enableAutoRefresh, refreshRate)}
              />
              <Clients
                data={statisticsData.clients}
                loading={isStatisticsLoading}
                onRefresh={() => {
                  dispatch(fetchRdiStatistics(rdiInstanceId, 'clients'))
                }}
                onRefreshClicked={() => onRefreshClicked('clients')}
                onChangeAutoRefresh={(enableAutoRefresh: boolean, refreshRate: string) =>
                  onChangeAutoRefresh('clients', enableAutoRefresh, refreshRate)}
              />
            </>
          )}
        </div>
      </div>
    </RdiInstancePageTemplate>
  )
}

export default StatisticsPage
