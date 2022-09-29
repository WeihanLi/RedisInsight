import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  defaultInstanceChanging,
  defaultInstanceChangingFailure,
  defaultInstanceChangingSuccess,
  loadInstances,
} from 'uiSrc/slices/instances/instances'

import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { getApiErrorsFromBulkOperation, parseAddedMastersSentinel, parseMastersSentinel } from 'uiSrc/utils'
import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel'
import { AddSentinelMasterResponse, AddSentinelMastersDto } from 'apiSrc/modules/instances/dto/redis-sentinel.dto'

import reducer, {
  initialState,
  sentinelSelector,
  loadMastersSentinel,
  loadMastersSentinelSuccess,
  loadMastersSentinelFailure,
  fetchMastersSentinelAction,
  setInstanceSentinel,
  createMastersSentinelAction,
  createMastersSentinelSuccess,
  createMastersSentinel,
  createMastersSentinelFailure,
  updateMastersSentinel,
  cloneMasterSentinelAction,
} from '../../instances/sentinel'
import { addErrorNotification, addMessageNotification } from '../../app/notifications'
import { LoadedSentinel, ModifiedSentinelMaster } from '../../interfaces'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let masters: SentinelMaster[]
let parsedMasters: ModifiedSentinelMaster[]
let parsedAddedMasters: ModifiedSentinelMaster[]
let addedMastersStatuses: AddSentinelMasterResponse[]

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  masters = [
    {
      host: '127.0.0.1',
      port: 6379,
      name: 'mymaster-2',
      numberOfSlaves: 1,
      endpoints: [{ host: 'localhost', port: 5005 }],
    },
    {
      host: '127.0.0.1',
      port: 6379,
      name: 'mymaster',
      numberOfSlaves: 0,
      endpoints: [
        { host: 'localhost', port: 5005 },
        { host: '127.0.0.1', port: 5006 },
      ],
    },
  ]

  addedMastersStatuses = [
    {
      id: 'ce935f36-057a-40a6-a796-4045e4b123bd',
      name: 'mymaster',
      status: 'success',
      message: 'Added',
    },
    {
      name: 'mymaster-2',
      status: 'fail',
      message: 'Failed to authenticate, please check the username or password.',
      error: {
        statusCode: 401,
        message:
          'Failed to authenticate, please check the username or password.',
        error: 'Unauthorized',
      },
    },
  ]

  parsedMasters = parseMastersSentinel(masters)
  parsedAddedMasters = parseAddedMastersSentinel(
    parsedMasters,
    addedMastersStatuses
  )
})

/**
 * sentinel slice tests
 *
 * @group unit
 */
describe('sentinel slice', () => {
/**
 * reducer, actions and selectors tests
 *
 * @group unit
 */
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  /**
 * loadMastersSentinel tests
 *
 * @group unit
 */
  describe('loadMastersSentinel', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadMastersSentinel())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  /**
 * updateMastersSentinel tests
 *
 * @group unit
 */
  describe('updateMastersSentinel', () => {
    it('should properly set loading = true', () => {
      // Arrange

      const data: ModifiedSentinelMaster[] = [
        { name: 'mymaster', host: 'localhost', port: 0, numberOfSlaves: 10 },
      ]

      const state = {
        ...initialState,
        data,
      }

      // Act
      const nextState = reducer(initialState, updateMastersSentinel(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  /**
 * loadMastersSentinelSuccess tests
 *
 * @group unit
 */
  describe('loadMastersSentinelSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        data: parsedMasters,
        loaded: {
          ...initialState.loaded,
          [LoadedSentinel.Masters]: true,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadMastersSentinelSuccess(masters)
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
        loaded: {
          ...initialState.loaded,
          [LoadedSentinel.Masters]: true,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMastersSentinelSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  /**
 * loadMastersSentinelFailure tests
 *
 * @group unit
 */
  describe('loadMastersSentinelFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: [],
      }

      // Act
      const nextState = reducer(initialState, loadMastersSentinelFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  /**
 * createMastersSentinel tests
 *
 * @group unit
 */
  describe('createMastersSentinel', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, createMastersSentinel())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  /**
 * createMastersSentinelSuccess tests
 *
 * @group unit
 */
  describe('createMastersSentinelSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        data: parsedAddedMasters,
        statuses: addedMastersStatuses,
        loaded: {
          ...initialState.loaded,
          [LoadedSentinel.MastersAdded]: true,
        },
      }

      // Act
      const nextState = reducer(
        { ...initialState, data: parsedMasters },
        createMastersSentinelSuccess(addedMastersStatuses)
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
        loaded: {
          ...initialState.loaded,
          [LoadedSentinel.MastersAdded]: true,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        createMastersSentinelSuccess(data)
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  /**
 * createMastersSentinelFailure tests
 *
 * @group unit
 */
  describe('createMastersSentinelFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: [],
      }

      // Act
      const nextState = reducer(
        initialState,
        createMastersSentinelFailure(data)
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  /**
 * thunks tests
 *
 * @group unit
 */
  describe('thunks', () => {
    it('call both fetchMastersSentinelAction and loadMastersSentinelSuccess when fetch is successed', async () => {
      // Arrange
      const requestData = {
        host: 'localhost',
        port: 5005,
      }

      const responsePayload = { data: masters, status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchMastersSentinelAction(requestData))

      // Assert
      const expectedActions = [
        loadMastersSentinel(),
        setInstanceSentinel(requestData),
        loadMastersSentinelSuccess(responsePayload.data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchMastersSentinelAction and loadMastersSentinelFailure when fetch is fail', async () => {
      // Arrange
      const requestData = {
        host: 'localhost',
        port: 5005,
      }

      const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(fetchMastersSentinelAction(requestData))

      // Assert
      const expectedActions = [
        loadMastersSentinel(),
        loadMastersSentinelFailure(responsePayload.response.data.message),
        addErrorNotification(responsePayload as AxiosError),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('call both createMastersSentinelAction and createMastersSentinelSuccess when fetch is successed', async () => {
    // Arrange
    const requestData = [
      {
        alias: 'db test1',
        name: 'mymaster',
      },
      {
        alias: 'db test2',
        name: 'mymaster-2',
        username: 'egor',
        password: '123',
      },
    ]

    const responsePayload = { data: addedMastersStatuses, status: 200 }

    apiService.post = jest.fn().mockResolvedValue(responsePayload)

    // Act
    await store.dispatch<any>(createMastersSentinelAction(requestData))

    // Assert
    const expectedActions = [
      createMastersSentinel(),
      createMastersSentinelSuccess(responsePayload.data),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('call both createMastersSentinelAction and createMastersSentinelFailure when fetch is fail', async () => {
    // Arrange
    const requestData = [
      {
        alias: 'db test1',
        name: 'mymaster',
      },
      {
        alias: 'db test2',
        name: 'mymaster-2',
        username: 'egor',
        password: '123',
      },
    ]

    const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
    const responsePayload = {
      response: {
        status: 500,
        data: { message: errorMessage },
      },
    }

    apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

    // Act
    await store.dispatch<any>(createMastersSentinelAction(requestData))

    // Assert
    const expectedActions = [
      createMastersSentinel(),
      createMastersSentinelFailure(responsePayload.response.data.message),
      addErrorNotification(responsePayload as AxiosError),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  /**
 * cloneMasterSentinelAction tests
 *
 * @group unit
 */
  describe('cloneMasterSentinelAction', () => {
    it('should call proper actions when fetch is succeed', async () => {
      // Arrange
      const requestData: AddSentinelMastersDto = {
        host: '11.1.1.1',
        port: 22,
        password: '1',
        masters: [
          {
            alias: 'sent',
            db: 0,
            name: 'sent',
            password: 'defaultpass',
          }
        ]
      }

      const responsePayload = { data: [addedMastersStatuses[0]], status: 200 }
      const responsePayloadInstances = { data: [], status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)
      apiService.get = jest.fn().mockResolvedValue(responsePayloadInstances)

      // Act
      await store.dispatch<any>(cloneMasterSentinelAction(requestData))

      // Assert
      const expectedActions = [
        defaultInstanceChanging(),
        defaultInstanceChangingSuccess(),
        loadInstances(),
        addMessageNotification(successMessages.ADDED_NEW_INSTANCE(requestData.masters[0].name ?? ''))
      ]

      expect(store.getActions()).toEqual(expectedActions)
    })

    it('should call proper actions when fetch is succeed with fail status', async () => {
      // Arrange
      const requestData: AddSentinelMastersDto = {
        host: '11.1.1.1',
        port: 22,
        password: '1',
        masters: [
          {
            alias: 'sent',
            db: 0,
            name: 'sent',
            password: 'defaultpass',
          }
        ]
      }

      const responsePayload = { data: [addedMastersStatuses[1]], status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(cloneMasterSentinelAction(requestData))

      const errors = getApiErrorsFromBulkOperation(responsePayload.data)

      // Assert
      const expectedActions = [
        defaultInstanceChanging(),
        addErrorNotification(errors[0]),
        defaultInstanceChangingFailure(errors[0]),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('should call proper actions when fetch is failed', async () => {
      // Arrange
      const requestData: AddSentinelMastersDto = {
        host: '11.1.1.1',
        port: 22,
        password: '1',
        masters: [
          {
            alias: 'sent',
            db: 0,
            name: 'sent',
            password: 'defaultpass',
          }
        ]
      }
      const errorMessage = 'Some error'

      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.post = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(cloneMasterSentinelAction(requestData))

      // Assert
      const expectedActions = [
        defaultInstanceChanging(),
        defaultInstanceChangingFailure(errorMessage),
        addErrorNotification(responsePayload as AxiosError),
      ]

      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
