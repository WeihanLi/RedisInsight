import { AxiosError } from 'axios'
import { capitalize, isEmpty, isString, isArray, set, isNumber } from 'lodash'
import React from 'react'
import { EuiSpacer } from '@elastic/eui'
import { CustomErrorCodes } from 'uiSrc/constants'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import { CustomError } from 'uiSrc/slices/interfaces'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

export const getRdiValidationMessage = (message: string = '', loc?: Array<string | number>): string => {
  // first item is always "body"
  if (!loc || !isArray(loc) || loc.length < 2) {
    return message
  }

  const [, ...rest] = loc
  const formattedLoc = rest.reduce<string[]>((acc, curr) => {
    if (isNumber(curr)) {
      acc[acc.length - 1] += `[${curr}]`
    } else {
      acc.push(curr)
    }
    return acc
  }, [])

  const field = formattedLoc.pop() as string
  const path = formattedLoc.join('/')
  const words = message.split(' ')

  words[0] = path ? `${field} in ${path}` : field

  return capitalize(words.join(' '))
}

export const parseCustomError = (err: CustomError | string = DEFAULT_ERROR_MESSAGE): AxiosError => {
  const error = {
    response: {
      status: 500,
      data: { },
    },
  }

  if (isString(err)) {
    return set(error, 'response.data.message', err) as AxiosError
  }

  let title: string = 'Error'
  let message: React.ReactElement | string = ''
  const additionalInfo: Record<string, any> = {}

  switch (err?.errorCode) {
    case CustomErrorCodes.CloudOauthGithubEmailPermission:
      title = 'Github Email Permission'
      message = (
        <>
          Unable to get an email from the GitHub account. Make sure that it is available.
          <br />
        </>
      )
      break
    case CustomErrorCodes.CloudOauthMisconfiguration:
      title = 'Misconfiguration'
      message = (
        <>
          Authorization server encountered a misconfiguration error and was unable to complete your request.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnknownAuthorizationRequest:
      title = 'Error'
      message = (
        <>
          Unknown authorization request.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnexpectedError:
      title = 'Error'
      message = (
        <>
          An unexpected error occurred.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudApiBadRequest:
      title = 'Bad request'
      message = (
        <>
          Your request resulted in an error.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiForbidden:
      title = 'Access denied'
      message = (
        <>
          You do not have permission to access Redis Cloud.
        </>
      )
      break

    case CustomErrorCodes.CloudApiInternalServerError:
      title = 'Server error'
      message = (
        <>
          Try restarting Redis Insight.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiNotFound:
      title = 'Resource was not found'
      message = (
        <>
          Resource requested could not be found.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudCapiUnauthorized:
    case CustomErrorCodes.CloudApiUnauthorized:
    case CustomErrorCodes.QueryAiUnauthorized:
      title = 'Session expired'
      message = (
        <>
          Sign in again to continue working with Redis Cloud.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudCapiKeyUnauthorized:
      title = 'Invalid API key'
      message = (
        <>
          Your Redis Cloud authorization failed.
          <EuiSpacer size="xs" />
          Remove the invalid API key from Redis Insight and try again.
          <EuiSpacer size="s" />
          Open the Settings page to manage Redis Cloud API keys.
        </>
      )
      additionalInfo.resourceId = err.resourceId
      additionalInfo.errorCode = err.errorCode
      break

    case CustomErrorCodes.CloudDatabaseAlreadyExistsFree:
      title = 'Database already exists'
      message = (
        <>
          You already have a free Redis Cloud database running.
          <EuiSpacer size="s" />
          Check out your <a href="https://app.redislabs.com/#/databases/?utm_source=redisinsight&utm_medium=main&utm_campaign=main" target="_blank" rel="noreferrer">Cloud console</a> for connection details.
        </>
      )
      break

    case CustomErrorCodes.RdiDeployPipelineFailure:
      title = 'Pipeline not deployed'
      message = 'Unfortunately we’ve found some errors in your pipeline.'
      additionalInfo.errorCode = err.errorCode
      break

    case CustomErrorCodes.RdiValidationError:
      const details = err?.details?.[0] || {}
      title = 'Validation error'
      message = getRdiValidationMessage(details.msg, details.loc)

      break

    default:
      title = 'Error'
      message = err?.message || DEFAULT_ERROR_MESSAGE
      break
  }

  const parsedError: any = { title, message }

  if (!isEmpty(additionalInfo)) {
    parsedError.additionalInfo = additionalInfo
  }

  return set(error, 'response.data', parsedError) as AxiosError
}
