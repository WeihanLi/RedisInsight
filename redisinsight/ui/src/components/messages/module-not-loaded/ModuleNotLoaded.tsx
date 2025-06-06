import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { EuiIcon, EuiText, EuiTextColor, EuiTitle } from '@elastic/eui'
import { useSelector } from 'react-redux'

import MobileIcon from 'uiSrc/assets/img/icons/mobile_module_not_loaded.svg?react'
import DesktopIcon from 'uiSrc/assets/img/icons/module_not_loaded.svg?react'
import TelescopeImg from 'uiSrc/assets/img/telescope-dark.svg?react'
import CheerIcon from 'uiSrc/assets/img/icons/cheer.svg?react'
import {
  FeatureFlags,
  MODULE_NOT_LOADED_CONTENT as CONTENT,
  MODULE_TEXT_VIEW,
} from 'uiSrc/constants'
import { OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { OAuthConnectFreeDb } from 'uiSrc/components'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'

import { getDbWithModuleLoaded } from 'uiSrc/utils'
import { useCapability } from 'uiSrc/services'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import ModuleNotLoadedButton from './ModuleNotLoadedButton'
import styles from './styles.module.scss'

export const MODULE_OAUTH_SOURCE_MAP: {
  [key in RedisDefaultModules]?: String
} = {
  [RedisDefaultModules.Bloom]: 'RedisBloom',
  [RedisDefaultModules.ReJSON]: 'RedisJSON',
  [RedisDefaultModules.Search]: 'RediSearch',
  [RedisDefaultModules.TimeSeries]: 'RedisTimeSeries',
}

export interface IProps {
  moduleName: RedisDefaultModules
  id: string
  onClose?: () => void
  type?: 'workbench' | 'browser'
}

const MIN_ELEMENT_WIDTH = 1210
const MAX_ELEMENT_WIDTH = 1440

const renderTitle = (width: number, moduleName?: string) => (
  <EuiTitle size="m" className={styles.title} data-testid="welcome-page-title">
    <h4>
      {`${moduleName?.substring(0, 1).toUpperCase()}${moduleName?.substring(1)} ${[MODULE_TEXT_VIEW.redisgears, MODULE_TEXT_VIEW.bf].includes(moduleName) ? 'are' : 'is'} not available `}
      {width > MAX_ELEMENT_WIDTH && <br />}
      for this database
    </h4>
  </EuiTitle>
)

const ListItem = ({ item }: { item: string }) => (
  <li className={styles.listItem}>
    <div className={styles.iconWrapper}>
      <CheerIcon className={styles.listIcon} />
    </div>
    <EuiTextColor className={styles.text}>{item}</EuiTextColor>
  </li>
)

const ModuleNotLoaded = ({
  moduleName,
  id,
  type = 'workbench',
  onClose,
}: IProps) => {
  const [width, setWidth] = useState(0)
  const freeInstances = useSelector(freeInstancesSelector) || []
  const { [FeatureFlags.cloudAds]: cloudAdsFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const module = MODULE_OAUTH_SOURCE_MAP[moduleName]

  const freeDbWithModule = getDbWithModuleLoaded(freeInstances, moduleName)
  const source =
    type === 'browser'
      ? OAuthSocialSource.BrowserSearch
      : OAuthSocialSource[module as keyof typeof OAuthSocialSource]

  useCapability(source)

  useEffect(() => {
    const parentEl = document?.getElementById(id)
    if (parentEl) {
      setWidth(parentEl.offsetWidth)
    }
  })

  const renderText = useCallback(
    (moduleName?: string) => {
      if (!cloudAdsFeature?.flag) {
        return (
          <EuiText className={cx(styles.text, styles.marginBottom)}>
            Open a database with {moduleName}.
          </EuiText>
        )
      }

      return !freeDbWithModule ? (
        <EuiText className={cx(styles.text, styles.marginBottom)}>
          Create a free trial Redis Stack database with {moduleName} which
          extends the core capabilities of your Redis.
        </EuiText>
      ) : (
        <EuiText
          className={cx(styles.text, styles.marginBottom, styles.textFooter)}
        >
          Use your free trial all-in-one Redis Cloud database to start exploring
          these capabilities.
        </EuiText>
      )
    },
    [freeDbWithModule],
  )

  return (
    <div
      className={cx(styles.container, {
        [styles.fullScreen]: width > MAX_ELEMENT_WIDTH || type === 'browser',
        [styles.modal]: type === 'browser',
      })}
    >
      <div className={styles.flex}>
        <div>
          {type !== 'browser' &&
            (width > MAX_ELEMENT_WIDTH ? (
              <DesktopIcon className={styles.bigIcon} />
            ) : (
              <MobileIcon className={styles.icon} />
            ))}
          {type === 'browser' && (
            <EuiIcon
              className={styles.iconTelescope}
              type={TelescopeImg}
              size="original"
            />
          )}
        </div>
        <div
          className={styles.contentWrapper}
          data-testid="module-not-loaded-content"
        >
          {renderTitle(width, MODULE_TEXT_VIEW[moduleName])}
          <EuiText className={styles.bigText}>
            {CONTENT[moduleName]?.text.map((item: string) =>
              width > MIN_ELEMENT_WIDTH ? (
                <>
                  {item}
                  <br />
                </>
              ) : (
                item
              ),
            )}
          </EuiText>
          <ul
            className={cx(styles.list, {
              [styles.bloomList]: moduleName === RedisDefaultModules.Bloom,
            })}
          >
            {CONTENT[moduleName]?.improvements.map((item: string) => (
              <ListItem key={item} item={item} />
            ))}
          </ul>
          {!!CONTENT[moduleName]?.additionalText && (
            <EuiText
              className={cx(
                styles.text,
                styles.additionalText,
                styles.marginBottom,
              )}
            >
              {CONTENT[moduleName]?.additionalText.map((item: string) =>
                width > MIN_ELEMENT_WIDTH ? (
                  <>
                    {item}
                    <br />
                  </>
                ) : (
                  item
                ),
              )}
            </EuiText>
          )}
          {renderText(MODULE_TEXT_VIEW[moduleName])}
        </div>
      </div>
      <div
        className={styles.linksWrapper}
        data-testid="module-not-loaded-cta-wrapper"
      >
        {freeDbWithModule ? (
          <OAuthConnectFreeDb source={source} id={freeDbWithModule.id} />
        ) : (
          <ModuleNotLoadedButton
            moduleName={moduleName}
            module={module}
            type={type}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

export default React.memo(ModuleNotLoaded)
