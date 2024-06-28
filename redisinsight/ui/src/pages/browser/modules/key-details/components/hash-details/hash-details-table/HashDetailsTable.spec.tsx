import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { KeyValueCompressor, TEXT_DISABLED_COMPRESSED_VALUE } from 'uiSrc/constants'
import { hashDataSelector } from 'uiSrc/slices/browser/hash'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { anyToBuffer, bufferToString } from 'uiSrc/utils'
import { act, cleanup, fireEvent, mockedStore, render, screen, waitForEuiToolTipVisible } from 'uiSrc/utils/test-utils'
import { GZIP_COMPRESSED_VALUE_1, GZIP_COMPRESSED_VALUE_2, DECOMPRESSED_VALUE_STR_1, DECOMPRESSED_VALUE_STR_2 } from 'uiSrc/utils/tests/decompressors'
import { setSelectedKeyRefreshDisabled } from 'uiSrc/slices/browser/keys'
import { HashDetailsTable, Props } from './HashDetailsTable'

const mockedProps = mock<Props>()
const fields: Array<{ field: any, value: any, expire?: number }> = [
  { field: { type: 'Buffer', data: [49] }, value: { type: 'Buffer', data: [49, 65] } },
  { field: { type: 'Buffer', data: [49, 50, 51] }, value: { type: 'Buffer', data: [49, 11] } },
  { field: { type: 'Buffer', data: [50] }, value: { type: 'Buffer', data: [49, 234, 453] }, expire: 300 },
]

jest.mock('uiSrc/slices/browser/hash', () => {
  const defaultState = jest.requireActual('uiSrc/slices/browser/hash').initialState
  return ({
    hashSelector: jest.fn().mockReturnValue(defaultState),
    updateHashValueStateSelector: jest.fn().mockReturnValue(defaultState.updateValue),
    hashDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: '123zxczxczxc',
      fields
    }),
    setHashInitialState: jest.fn,
    fetchHashFields: () => jest.fn
  })
})

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    compressor: null,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('HashDetailsTable', () => {
  it('should render', () => {
    expect(render(<HashDetailsTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<HashDetailsTable {...instance(mockedProps)} />)
    const rows = container.querySelectorAll('.ReactVirtualized__Table__row[role="row"]')
    expect(rows).toHaveLength(fields.length)
  })

  it('should render search input', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(
      searchInput,
      { target: { value: '*1*' } }
    )
    expect(searchInput).toHaveValue('*1*')
  })

  it('should render delete popup after click remove button', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/remove-hash-button/)[0])
    expect(screen.getByTestId(`remove-hash-button-${bufferToString(fields[0].field)}-icon`)).toBeInTheDocument()
  })

  it('should render editor after click edit button', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('hash_content-value-1'))
    })

    fireEvent.click(screen.getByTestId('hash_edit-btn-1'))
    expect(screen.getByTestId('hash_value-editor-1')).toBeInTheDocument()
  })

  it('should render resize trigger for field column', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('resize-trigger-field')).toBeInTheDocument()
  })

  it('should disable refresh after click on edit', async () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('hash_content-value-1'))
    })

    act(() => {
      fireEvent.click(screen.getByTestId('hash_edit-btn-1'))
    })

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true)
    ])
  })

  it('should not render ttl column', async () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    expect(screen.queryByTestId('hash-ttl_content-value-2')).not.toBeInTheDocument()
  })

  it('should render ttl column', async () => {
    render(<HashDetailsTable {...instance(mockedProps)} isExpireFieldsAvailable />)

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('hash-ttl_content-value-2'))
    })

    act(() => {
      fireEvent.click(screen.getByTestId('hash-ttl_edit-btn-2'))
    })

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true)
    ])
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data', () => {
      const defaultState = jest.requireActual('uiSrc/slices/browser/hash').initialState
      const hashDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        total: 1,
        key: '123zxczxczxc',
        fields: [
          { field: anyToBuffer(GZIP_COMPRESSED_VALUE_1), value: anyToBuffer(GZIP_COMPRESSED_VALUE_2) },
        ]
      });
      (hashDataSelector as jest.Mock).mockImplementation(hashDataSelectorMock)

      const { queryAllByTestId } = render(<HashDetailsTable {...instance(mockedProps)} />)
      const fieldEl = queryAllByTestId(/hash-field-/)?.[0]
      const valueEl = queryAllByTestId(/hash_content-value/)?.[0]

      expect(fieldEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
      expect(valueEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_2)
    })

    it('edit button should be disabled if data was compressed', async () => {
      const defaultState = jest.requireActual('uiSrc/slices/browser/hash').initialState
      const hashDataSelectorMock = jest.fn().mockReturnValueOnce({
        ...defaultState,
        total: 1,
        key: '123zxczxczxc',
        fields: [
          { field: anyToBuffer(GZIP_COMPRESSED_VALUE_1), value: anyToBuffer(GZIP_COMPRESSED_VALUE_2) },
        ]
      });
      (hashDataSelector as jest.Mock).mockImplementationOnce(hashDataSelectorMock);

      (connectedInstanceSelector as jest.Mock).mockImplementationOnce(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      const { queryByTestId } = render(<HashDetailsTable {...instance(mockedProps)} />)

      act(() => {
        fireEvent.mouseEnter(screen.getByTestId('hash_content-value-1'))
      })

      const editBtn = screen.getByTestId('hash_edit-btn-1')
      fireEvent.click(editBtn)

      await act(async () => {
        fireEvent.mouseOver(editBtn)
      })
      await waitForEuiToolTipVisible()

      expect(editBtn).toBeDisabled()
      expect(screen.getByTestId('hash_edit-tooltip-1')).toHaveTextContent(TEXT_DISABLED_COMPRESSED_VALUE)
      expect(queryByTestId('hash_value-editor-1')).not.toBeInTheDocument()
    })
  })
})
