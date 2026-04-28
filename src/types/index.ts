export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  style: string[]
  city: string
  role: 'skater' | 'admin'
  created_at: string
}

export interface Spot {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  difficulty: 'Fácil' | 'Medio' | 'Pro'
  status: 'Activo' | 'Borrado' | 'En obras'
  added_by: string | null
  created_at: string
  profiles?: Profile
  spot_photos?: SpotPhoto[]
  tricks?: Trick[]
  vote_count?: number
}

export interface SpotPhoto {
  id: string
  spot_id: string
  url: string
  uploaded_by: string | null
  created_at: string
}

export interface Trick {
  id: string
  spot_id: string
  posted_by: string | null
  trick_name: string
  media_url: string | null
  media_type: 'imagen' | 'video' | null
  vote_count: number
  created_at: string
  profiles?: Profile
  spots?: Spot
  user_voted?: boolean
}

export interface Vote {
  id: string
  trick_id: string
  user_id: string
}

export type DifficultyLevel = 'Fácil' | 'Medio' | 'Pro'
export type SpotStatus = 'Activo' | 'Borrado' | 'En obras'
export type SkateStyle = 'Street' | 'Park' | 'Cruiser'
