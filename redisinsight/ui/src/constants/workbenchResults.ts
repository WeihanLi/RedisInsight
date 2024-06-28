import { RedisDefaultModules } from 'uiSrc/slices/interfaces'

export const bulkReplyCommands = ['LOLWUT', 'INFO', 'CLIENT', 'CLUSTER', 'MEMORY', 'MONITOR', 'PSUBSCRIBE']

export const EMPTY_COMMAND = 'Encrypted data'

export const MODULE_NOT_LOADED_CONTENT: { [key in RedisDefaultModules]?: any } = {
  [RedisDefaultModules.TimeSeries]: {
    text: ['RedisTimeSeries adds a Time Series data structure to Redis. ', 'With this capability you can:'],
    improvements: [
      'Add sample data',
      'Perform cross-time-series range and aggregation queries',
      'Define compaction rules for economical retention of historical data'
    ],
    link: 'https://redis.io/docs/latest/develop/data-types/timeseries/'
  },
  [RedisDefaultModules.Search]: {
    text: ['RediSearch adds the capability to:'],
    improvements: [
      'Query',
      'Secondary index',
      'Full-text search'
    ],
    additionalText: ['These features enable multi-field queries, aggregation, exact phrase matching, numeric filtering, ', 'geo filtering and vector similarity semantic search on top of text queries.'],
    link: 'https://redis.io/docs/interact/search-and-query/'
  },
  [RedisDefaultModules.ReJSON]: {
    text: ['RedisJSON adds the capability to:'],
    improvements: [
      'Store JSON documents',
      'Update JSON documents',
      'Retrieve JSON documents'
    ],
    additionalText: ['RedisJSON also works seamlessly with RediSearch to let you index and query JSON documents.'],
    link: 'https://redis.io/docs/latest/develop/data-types/json/'
  },
  [RedisDefaultModules.Bloom]: {
    text: ['RedisBloom adds a set of probabilistic data structures to Redis, including:'],
    improvements: [
      'Bloom filter',
      'Cuckoo filter',
      'Count-min sketch',
      'Top-K',
      'T-digest'
    ],
    additionalText: ['With this capability you can query streaming data without needing to store all the elements of the stream.'],
    link: 'https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/'
  },
}

export const MODULE_TEXT_VIEW: { [key in RedisDefaultModules]?: string } = {
  [RedisDefaultModules.Bloom]: 'RedisBloom',
  [RedisDefaultModules.ReJSON]: 'RedisJSON',
  [RedisDefaultModules.Search]: 'RediSearch',
  [RedisDefaultModules.TimeSeries]: 'RedisTimeSeries',
}
