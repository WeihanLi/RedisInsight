import React, { ReactElement } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { appCsrfSelector, fetchCsrfToken } from 'uiSrc/slices/app/csrf';
import PagePlaceholder from '../page-placeholder'

const Csrf = ({ children }: { children: ReactElement }) => {
  const dispatch = useDispatch()
  const { csrfEndpoint, loading } = useSelector(appCsrfSelector)

  dispatch(fetchCsrfToken())

  return loading && csrfEndpoint ? <PagePlaceholder /> : children
}

export default Csrf
