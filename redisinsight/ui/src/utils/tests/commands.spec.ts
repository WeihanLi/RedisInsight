import { ICommandArgGenerated, ICommands, MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { generateArgs, generateArgsNames, getComplexityShortNotation, getDocUrlForCommand } from '../commands'
import { cleanup } from '../test-utils'

const ALL_REDIS_COMMANDS: ICommands = MOCK_COMMANDS_SPEC

interface IMockedCommands {
  matchedCommand: string;
  argStr?: string;
  argsNamesWithEnumsMock?: string[];
  argsNamesMock?: string[];
  complexityShortMock?: string;
}

beforeEach(() => {
  cleanup()
})

const mockedCommands: IMockedCommands[] = [
  {
    matchedCommand: 'xgroup',
    argStr:
      'XGROUP [CREATE key groupname ID|$ [MKSTREAM]] [SETID key groupname ID|$] [DESTROY key groupname] [CREATECONSUMER key groupname consumername] [DELCONSUMER key groupname consumername]',
    argsNamesWithEnumsMock: [
      '[CREATE key groupname ID|$ [MKSTREAM]]',
      '[SETID key groupname ID|$]',
      '[DESTROY key groupname]',
      '[CREATECONSUMER key groupname consumername]',
      '[DELCONSUMER key groupname consumername]',
    ],
    argsNamesMock: [
      '[CREATE key groupname id [MKSTREAM]]',
      '[SETID key groupname id]',
      '[DESTROY key groupname]',
      '[CREATECONSUMER key groupname consumername]',
      '[DELCONSUMER key groupname consumername]',
    ],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'hset',
    argStr: 'HSET key field value [field value ...]',
    argsNamesWithEnumsMock: ['key', 'field', 'value', '[field value ...]'],
    argsNamesMock: ['key', 'field value'],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'acl setuser',
    argStr: 'ACL SETUSER username [rule [rule ...]]',
    argsNamesWithEnumsMock: ['username', '[rule [rule ...]]'],
    argsNamesMock: ['username', '[rule]'],
    complexityShortMock: 'O(N)',
  },
  {
    matchedCommand: 'bitfield',
    argStr:
      'BITFIELD key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP|SAT|FAIL]',
    argsNamesWithEnumsMock: [
      'key',
      '[GET type offset]',
      '[SET type offset value]',
      '[INCRBY type offset increment]',
      '[OVERFLOW WRAP|SAT|FAIL]',
    ],
    argsNamesMock: [
      'key',
      '[GET type offset]',
      '[SET type offset value]',
      '[INCRBY type offset increment]',
      '[OVERFLOW WRAP|SAT|FAIL]',
    ],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'client kill',
    argStr:
      'CLIENT KILL [ip:port] [ID client-id] [TYPE normal|master|slave|pubsub] [USER username] [ADDR ip:port] [LADDR ip:port] [SKIPME yes/no]',
    argsNamesWithEnumsMock: [
      '[ip:port]',
      '[ID client-id]',
      '[TYPE normal|master|slave|pubsub]',
      '[USER username]',
      '[ADDR ip:port]',
      '[LADDR ip:port]',
      '[SKIPME yes/no]',
    ],
    argsNamesMock: [
      '[ip:port]',
      '[ID client-id]',
      '[TYPE normal|master|slave|pubsub]',
      '[USER username]',
      '[ADDR ip:port]',
      '[LADDR ip:port]',
      '[SKIPME yes/no]',
    ],
    complexityShortMock: 'O(N)',
  },
  {
    matchedCommand: 'geoadd',
    argStr: 'GEOADD key [NX|XX] [CH] longitude latitude member [longitude latitude member ...]',
    argsNamesWithEnumsMock: [
      'key',
      '[NX|XX]',
      '[CH]',
      'longitude',
      'latitude',
      'member',
      '[longitude latitude member ...]',
    ],
    argsNamesMock: ['key', '[condition]', '[change]', 'longitude latitude member'],
    complexityShortMock: 'O(log(N))',
  },
  {
    matchedCommand: 'zadd',
    argStr: 'ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]',
    argsNamesWithEnumsMock: [
      'key',
      '[NX|XX]',
      '[GT|LT]',
      '[CH]',
      '[INCR]',
      'score',
      'member',
      '[score member ...]',
    ],
    argsNamesMock: [
      'key',
      '[condition]',
      '[comparison]',
      '[change]',
      '[increment]',
      'score member',
    ],
    complexityShortMock: 'O(log(N))',
  },
]

/**
 * getComplexityShortNotation tests
 *
 * @group unit
 */
describe('getComplexityShortNotation', () => {
  it('Complexity short should return text according mocked data', () => {
    mockedCommands.forEach(({ matchedCommand = '', complexityShortMock }) => {
      const complexity = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.complexity ?? ''
      const complexityShort = getComplexityShortNotation(complexity)

      if (complexityShort) {
        expect(complexityShort).toEqual(complexityShortMock)
      } else {
        expect(complexityShort).toEqual('')
      }
    })
  })
  it('handle case when complexity is array of strings', () => {
    const result = getComplexityShortNotation([
      'O(1) for each field/value pair added',
      'O(N) to add N field/value pairs when the command is called with multiple field/value pairs.'
    ])

    expect(result).toEqual('')
  })
})

/**
 * generateArgs tests
 *
 * @group unit
 */
describe('generateArgs', () => {
  it('generateArgs short should return argument with GeneratedName (with Enums names)', () => {
    mockedCommands.forEach(({ matchedCommand = '', argsNamesMock = [] }) => {
      const argsInit = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

      const argsMocked: ICommandArgGenerated[] = argsInit.map((arg, i) => ({
        ...arg,
        generatedName: argsNamesMock[i] ?? '',
      }))

      const args = generateArgs(argsInit)

      expect(args).toEqual(argsMocked)
    })
  })
})

/**
 * generateArgName tests
 *
 * @group unit
 */
describe('generateArgName', () => {
  it('Arguments names should return text according mocked data (with Enums values)', () => {
    mockedCommands.forEach(({ matchedCommand = '', argsNamesWithEnumsMock }) => {
      const args = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

      const generatedArgNames = generateArgsNames(args)
      expect(generatedArgNames).toEqual(argsNamesWithEnumsMock)
    })
  })
  it('Arguments names should return text according mocked data (with Enums names)', () => {
    mockedCommands.forEach(({ matchedCommand = '', argsNamesMock }) => {
      const args = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

      const generatedArgNames = generateArgsNames(args, true)
      expect(generatedArgNames).toEqual(argsNamesMock)
    })
  })
})

const getDocUrlForCommandTests: any[] = [
  ['SET', 'https://redis.io/commands/set'],
  ['ACL SETUSER', 'https://redis.io/commands/acl-setuser'],
  ['JSON.GET', 'https://redis.io/commands/json.get'],
  ['FT.CREATE', 'https://redis.io/commands/ft.create'],
  ['FT.ALTER', 'https://redis.io/commands/ft.alter'],
  ['TS.ADD', 'https://redis.io/commands/ts.add'],
  ['TS.CREATE', 'https://redis.io/commands/ts.create'],
  ['GRAPH.EXPLAIN', 'https://redis.io/commands/graph.explain'],
  ['GRAPH.QUERY', 'https://redis.io/commands/graph.query'],
  ['AI.MODELRUN', 'https://redis.io/commands/ai.modelrun'],
  ['BF.INFO', 'https://redis.io/commands/bf.info'],
  ['CMS.INITBYDIM', 'https://redis.io/commands/cms.initbydim'],
  ['CF.INSERT', 'https://redis.io/commands/cf.insert'],
  ['RG.CONFIGSET', 'https://redis.io/commands/rg.configset'],
  ['TOPK.INFO', 'https://redis.io/commands/topk.info'],
  ['AI.SCRIPTDEL', 'https://redis.io/commands/ai.scriptdel'],
  ['NON EXIST COMMAND', 'https://redis.io/commands/non-exist-command'],
  ['NON.EXIST COMMAND', 'https://redis.io/commands/non.exist-command'],
]

/**
 * getDocUrlForCommand tests
 *
 * @group unit
 */
describe('getDocUrlForCommand', () => {
  it.each(getDocUrlForCommandTests)('for input: %s (command), should be output: %s',
    (command, expected) => {
      const result = getDocUrlForCommand(command)
      expect(result).toBe(expected)
    })
})
