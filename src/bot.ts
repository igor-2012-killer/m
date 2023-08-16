import createDebug from 'debug'
import 'dotenv/config'

import env from 'env-var'

import { HEIGHT, WIDTH } from './constants'

import { Lastfm, RecentTracks, TrackInfo } from './lastfm'
import { render } from './renderer'
import { getTrackId, removeBroadcastingTrack, removeCover, setBroadcastingTrack, uploadCover } from './vk'

const debug_vk = createDebug('vk-cover:vk')
const debug_renderer = createDebug('vk-cover:renderer')

const LASTFM_API_KEY = env.get('LASTFM_API_KEY').asString()
const LASTFM_USERNAME = env.get('LASTFM_USERNAME').asString()

const USE_LASTFM = env.get('USE_LASTFM').required().asBool()
const BROADCAST_TRACK_IN_STATUS = env.get('BROADCAST_TRACK_IN_STATUS').required().asBool()

const lastfmDataFound = LASTFM_API_KEY !== undefined && LASTFM_USERNAME !== undefined

if (USE_LASTFM && !lastfmDataFound) {
  throw new TypeError('specified `"use_lastfm": true` but either API key or username are missing')
}

const run = async () => {

  let scrobbles = 0

  // INFO: parse scrobbles only if we have lastfm account info

  if (LASTFM_API_KEY) {
    const lastfm = new Lastfm({
      key: LASTFM_API_KEY
    })
    

    const currentScrobblingTrackData = await lastfm.call<RecentTracks>('user.getRecentTracks', {
      user: LASTFM_USERNAME,
      limit: 1
    })

    const currentScrobblingTrack = currentScrobblingTrackData.recenttracks.track[0]

    const scrobblesData = await lastfm.call<TrackInfo>('track.getInfo', {
      artist: currentScrobblingTrack.artist['#text'],
      track: currentScrobblingTrack.name,
      username: LASTFM_USERNAME
    })

    scrobbles = Number.parseInt(scrobblesData.track?.userplaycount) ?? 0

    const { buffer, renderTime } = await render({
      width: WIDTH,
      height: HEIGHT,
      scrobbles,

      imageUrl: currentScrobblingTrackData.recenttracks.track[0].image[3]['#text'],
      progress: 123,

      trackName: scrobblesData.track.name,
      trackDuration: Number(scrobblesData.track?.duration),

      artists: currentScrobblingTrack.artist['#text'] // artists? artists!
    })

    debug_renderer(renderTime)

    return uploadCover(buffer)
  }
}

setInterval(run, 60000)
