import {SOURCE_TYPE_INFLUX_V2} from 'src/shared/constants'
import {Source} from 'src/types'
import AJAX from 'src/utils/ajax'

export interface DBRP {
  id: string
  bucketID: string
  database: string
  retention_policy: string
  default: boolean
}

async function getTelegrafBucketID(
  source: Source
): Promise<string | undefined> {
  // try to get bucket of the same name
  const v2BucketsPath = `/api/v2/buckets?org=${encodeURIComponent(
    source.username
  )}&name=${encodeURIComponent(source.telegraf)}`
  try {
    const response = await AJAX({
      method: 'GET',
      url: `${source.links.flux}?version=${encodeURIComponent(
        source.version
      )}&path=${encodeURIComponent(v2BucketsPath)}`,
      data: '',
    })
    if (response.status !== 200) {
      return undefined
    }
    return response.data?.buckets?.[0]?.id
    // eslint-disable-next-line no-empty
  } catch (e) {}
}

async function createDBRPMapping(
  source: Source,
  bucketID: string
): Promise<DBRP | undefined> {
  // try to get bucket of the same name
  const body = {
    bucketID,
    database: source.telegraf,
    retention_policy: source.defaultRP || 'autogen',
    default: true,
    org: source.username,
  }
  try {
    const response = await AJAX({
      method: 'POST',
      url: `${source.links.flux}?version=${encodeURIComponent(
        source.version
      )}&path=/api/v2/dbrps`,
      data: body,
      headers: {'Content-Type': 'application/json'},
    })
    if (response.status === 201 && response.data.id) {
      return response.data as DBRP
    }
    console.warn('Cannot create v1 DBRP mapping', response.data)
  } catch (e) {
    console.warn('Cannot create v1 DBRP mapping', e)
  }
}

export async function createDBRP(source: Source): Promise<DBRP | undefined> {
  if (
    !source.links?.flux ||
    source.type !== SOURCE_TYPE_INFLUX_V2 ||
    !source.telegraf
  ) {
    return
  }

  const bucketID = await getTelegrafBucketID(source)
  if (!bucketID) {
    console.warn(
      `Cannot verify existence of ${source.telegraf} bucket, v1 DBRP mapping cannot be created`
    )
    return
  }

  // create DBRP mappings for bucket id
  return await createDBRPMapping(source, bucketID)
}
