export interface Playlist {
  id: string
  user_id: string
  playlist_url: string
  playlist_id: string
  title: string
  total_videos: number
  total_duration_seconds: number
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface Routine {
  id: string
  user_id: string
  playlist_id: string
  videos_per_day: number
  target_completion_date: string | null
  start_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  playlist_id: string
  video_id: string
  title: string
  duration_seconds: number
  thumbnail_url: string | null
  position: number
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  routine_id: string
  video_id: string
  scheduled_date: string
  is_completed: boolean
  completed_at: string | null
  created_at: string
  video?: Video
}

export interface PlaylistPreferences {
  videosPerDay?: number
  targetCompletionDate?: string
  preferredDays?: string[]
}

export interface YouTubePlaylistInfo {
  playlistId: string
  title: string
  videos: {
    videoId: string
    title: string
    durationSeconds: number
    thumbnailUrl: string
    position: number
  }[]
  totalDurationSeconds: number
}
