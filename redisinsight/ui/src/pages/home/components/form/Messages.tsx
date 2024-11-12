import React from 'react'
import { EuiLink, EuiText } from '@elastic/eui'
import { APPLICATION_NAME } from 'uiSrc/constants'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import styles from '../styles.module.scss'

const MessageCloudApiKeys = () => (
  <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
    {'Enter Redis Cloud API keys to discover and add databases. API keys can be enabled by following the steps mentioned in the '}
    <EuiLink
      color="text"
      className={styles.link}
      external={false}
      target="_blank"
      href="https://docs.redis.com/latest/rc/api/get-started/enable-the-api/"
    >
      documentation.
    </EuiLink>
  </EuiText>
)

const MessageStandalone = () => (
  <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
    You can manually add your Redis databases. Enter host and port of your Redis database to add it to
    {' '}
    {APPLICATION_NAME}
    . &nbsp;
    <EuiLink
      color="text"
      href={getUtmExternalLink('https://redis.io/docs/latest/develop/connect/insight#connection-management', { campaign: 'redisinsight' })}
      className={styles.link}
      external={false}
      target="_blank"
    >
      Learn more here.
    </EuiLink>
  </EuiText>
)

const MessageSentinel = () => (
  <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
    You can automatically discover and add primary groups from your Redis Sentinel.
    Enter host and port of your Redis Sentinel to automatically discover your primary groups and add them to
    {' '}
    {APPLICATION_NAME}
    . &nbsp;
    <EuiLink
      color="text"
      href={getUtmExternalLink('https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/', { campaign: 'redisinsight' })}
      className={styles.link}
      external={false}
      target="_blank"
    >
      Learn more here.
    </EuiLink>
  </EuiText>
)

const MessageEnterpriceSoftware = () => (
  <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
    Your Redis Software databases can be automatically added. Enter the connection details of your
    Redis Software Cluster to automatically discover your databases and add them to
    {' '}
    {APPLICATION_NAME}
    . &nbsp;
    <EuiLink
      color="text"
      href={getUtmExternalLink('https://redis.io/redis-enterprise-software/overview/', { campaign: 'redisinsight' })}
      className={styles.link}
      external={false}
      target="_blank"
    >
      Learn more here.
    </EuiLink>
  </EuiText>
)

export {
  MessageStandalone,
  MessageSentinel,
  MessageCloudApiKeys,
  MessageEnterpriceSoftware,
}
