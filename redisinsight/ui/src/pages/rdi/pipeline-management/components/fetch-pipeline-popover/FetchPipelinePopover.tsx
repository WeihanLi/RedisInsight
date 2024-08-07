import {
  EuiButton,
  EuiButtonEmpty,
  EuiText
} from '@elastic/eui'
import { useFormikContext } from 'formik'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import ConfirmationPopover from 'uiSrc/pages/rdi/components/confirmation-popover/ConfirmationPopover'
import { IPipeline } from 'uiSrc/slices/interfaces'
import { fetchRdiPipeline, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import Download from 'uiSrc/pages/rdi/pipeline-management/components/download/Download'
import UploadIcon from 'uiSrc/assets/img/rdi/upload_from_server.svg?react'

const FetchPipelinePopover = () => {
  const { loading, data } = useSelector(rdiPipelineSelector)

  const { resetForm } = useFormikContext<IPipeline>()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const handleRefreshClick = () => {
    dispatch(
      fetchRdiPipeline(rdiInstanceId, () => {
        resetForm()
      })
    )
  }

  const handleRefreshWarning = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FROM_SERVER_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: data?.jobs?.length || 'none'
      }
    })
  }

  return (
    <ConfirmationPopover
      title="Download a pipeline from the server"
      body={(
        <>
          <EuiText size="s">
            When downloading a new pipeline from the server,
            it will overwrite the existing one displayed in Redis Insight.
          </EuiText>
        </>
      )}
      submitBtn={(
        <EuiButton
          fill
          size="s"
          color="secondary"
          data-testid="upload-confirm-btn"
        >
          Download from server
        </EuiButton>
      )}
      onConfirm={handleRefreshClick}
      button={(
        <EuiButtonEmpty
          color="text"
          size="xs"
          iconType={UploadIcon}
          disabled={loading}
          aria-labelledby="Upload pipeline button"
          data-testid="upload-pipeline-btn"
        >
          Download from server
        </EuiButtonEmpty>
      )}
      onButtonClick={handleRefreshWarning}
      appendAction={<Download />}
    />
  )
}

export default FetchPipelinePopover
