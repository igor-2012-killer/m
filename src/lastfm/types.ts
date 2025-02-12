export interface Artist {
  mbid: string
  '#text': string
}

export interface Track {
  image: any
  artist: Artist
  name: string
  url: string
  streamable: string
}

export interface RecentTracks {
  recenttracks: { track: Track[] }
}

export interface TrackStreamable {
  fulltrack: string
  '#text': string
}

export interface TrackInfoTrack {
  id: string
  name: string
  url: string
  duration: string
  streamable: TrackStreamable
  userplaycount: string
}

export interface TrackInfo {
  artist: string
  track: TrackInfoTrack
  error?: number
}
