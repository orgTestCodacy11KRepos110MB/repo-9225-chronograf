import AJAX from 'src/utils/ajax'
import _ from 'lodash'
import {proxy} from 'utils/queryUrlGenerator'
import uuid from 'uuid'

export const showDatabases = async source => {
  const query = 'SHOW DATABASES'
  return await proxy({source, query})
}

export const showRetentionPolicies = async (source, databases) => {
  let query
  if (Array.isArray(databases)) {
    query = databases
      .map(db => `SHOW RETENTION POLICIES ON "${_.escape(db)}"`)
      .join(';')
  } else {
    const dbs = _.split(databases, ',')
      .map(d => `${_.escape(d)}`)
      .join(',')
    query = `SHOW RETENTION POLICIES ON "${dbs}"`
  }

  return await proxy({source, query})
}

export function showQueries(source, db) {
  const query = 'SHOW QUERIES'

  return proxy({source, query, db})
}

export function killQuery(source, queryID, tcpHost) {
  let query

  if (tcpHost) {
    query = `KILL QUERY ${queryID} ON "${tcpHost}"`
  } else {
    query = `KILL QUERY ${queryID}`
  }

  return proxy({source, query})
}

export const showMeasurements = async (source, db) => {
  const query = 'SHOW MEASUREMENTS'

  return await proxy({source, db, query})
}

export const showTagKeys = async ({
  source,
  database,
  retentionPolicy,
  measurement,
}) => {
  const rp = _.toString(retentionPolicy)
  const query = `SHOW TAG KEYS FROM "${rp}"."${_.escape(measurement)}"`
  return await proxy({source, db: database, rp: retentionPolicy, query})
}

export const showTagValues = async ({
  source,
  database,
  retentionPolicy,
  measurement,
  tagKeys,
}) => {
  if (!tagKeys || !tagKeys.length) {
    // return empty response when no tag keys are supplied
    return {
      data: {
        results: [
          {
            statement_id: 0,
            series: [
              {
                name: 'empty',
                columns: ['key', 'value'],
                values: [],
              },
            ],
          },
        ],
        uuid: uuid.v4(),
      },
    }
  }
  const keys = tagKeys
    .sort()
    .map(k => `"${_.escape(k)}"`)
    .join(', ')
  const rp = _.toString(retentionPolicy)
  const query = `SHOW TAG VALUES FROM "${rp}"."${_.escape(
    measurement
  )}" WITH KEY IN (${keys})`

  return await proxy({source, db: database, rp: retentionPolicy, query})
}

export function showShards() {
  return AJAX({
    url: '/api/int/v1/show-shards',
  })
}

export const showFieldKeys = async (source, db, measurement, rp) => {
  const query = `SHOW FIELD KEYS FROM "${rp}"."${measurement}"`

  return await proxy({source, query, db})
}
