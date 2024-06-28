import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import {
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { FeatureFlags, KeyTypes } from 'uiSrc/constants'

import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import AddHashFields from './add-hash-fields/AddHashFields'
import { HashDetailsTable } from './hash-details-table'
import { AddItemsAction } from '../key-details-actions'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const HashDetails = (props: Props) => {
  const keyType = KeyTypes.Hash
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const { loading } = useSelector(selectedKeySelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const {
    [FeatureFlags.hashFieldExpiration]: hashFieldExpirationFeature
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const isExpireFieldsAvailable = hashFieldExpirationFeature?.flag
    && isVersionHigherOrEquals(version, CommandsVersions.HASH_TTL.since)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    setIsAddItemPanelOpen(false)
    if (isCancelled) {
      onCloseAddItemPanel()
    }
  }

  const Actions = ({ width }: { width: number }) => (
    <AddItemsAction title="Add Fields" width={width} openAddItemPanel={openAddItemPanel} />
  )

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        Actions={Actions}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <HashDetailsTable isExpireFieldsAvailable={isExpireFieldsAvailable} onRemoveKey={onRemoveKey} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <AddHashFields isExpireFieldsAvailable={isExpireFieldsAvailable} closePanel={closeAddItemPanel} />
          </div>
        )}
      </div>
    </div>
  )
}

export { HashDetails }
