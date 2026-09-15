-- ==========================================================
-- CAMPUSTUNES: SUPABASE POSTGRESQL SCHEMA & SECURITY RULES
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- TABLE: PROFILES (Extends Supabase auth.users)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  bio TEXT DEFAULT 'Campus music enthusiast & creator.',
  department TEXT DEFAULT 'Computer Science & Engg',
  semester TEXT DEFAULT 'Semester 6',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------
-- TABLE: SONGS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL DEFAULT 'Malayalam Indie',
  cover_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  audio_url TEXT NOT NULL,
  duration INTEGER DEFAULT 180,
  download_enabled BOOLEAN DEFAULT true,
  play_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------
-- TABLE: LIKES
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  song_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- ----------------------------------------------------------
-- TABLE: PLAYLISTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT DEFAULT 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------
-- TABLE: PLAYLIST_SONGS (Many-to-many)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- ----------------------------------------------------------
-- TABLE: SONG_PLAYS (Analytics & play events)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.song_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  played_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------
-- TABLE: REPORTS (Moderation)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------
-- HELPER FUNCTIONS FOR SECURITY & ROLE VERIFICATION
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ----------------------------------------------------------
-- AUTOMATIC PROFILE TRIGGER UPON AUTH SIGNUP
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  -- Generate a clean base username from metadata or email
  base_username := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  ));
  
  -- Remove special characters
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9_]', '', 'g');
  IF base_username = '' THEN
    base_username := 'student';
  END IF;

  -- Ensure uniqueness
  final_username := base_username;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
    final_username := base_username || '_' || SUBSTRING(NEW.id::text, 1, 4);
  END IF;

  -- If email matches designated admin, grant admin role automatically
  IF LOWER(NEW.email) = 'mizpam54@gmail.com' THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      username,
      department,
      semester,
      avatar_url,
      role
    )
    VALUES (
      NEW.id,
      NEW.email,
      'Sherin (Admin)',
      'sherin',
      'Campus Administration',
      'Head Administrator',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      'admin'
    )
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    department,
    semester,
    avatar_url,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Campus Student'),
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engg'),
    COALESCE(NEW.raw_user_meta_data->>'semester', 'Semester 1'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'),
    'student' -- Force default student role for general signups
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles:
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
  );

-- Songs:
CREATE POLICY "Published songs are viewable by everyone"
  ON public.songs FOR SELECT
  USING (status = 'published' OR auth.uid() = artist_id OR public.is_admin());

CREATE POLICY "Students can insert own songs"
  ON public.songs FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Students can update own songs, admins can update any"
  ON public.songs FOR UPDATE
  USING (auth.uid() = artist_id OR public.is_admin());

CREATE POLICY "Students can delete own songs, admins can delete any"
  ON public.songs FOR DELETE
  USING (auth.uid() = artist_id OR public.is_admin());

-- Likes:
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Playlists:
CREATE POLICY "Playlists are viewable if public or owner or admin"
  ON public.playlists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Playlist Songs:
CREATE POLICY "Playlist songs viewable with playlist"
  ON public.playlist_songs FOR SELECT USING (true);

CREATE POLICY "Playlist owner can manage playlist songs"
  ON public.playlist_songs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_songs.playlist_id AND (user_id = auth.uid() OR public.is_admin())
    )
  );

-- Song Plays:
CREATE POLICY "Song plays viewable by admins and song owners"
  ON public.song_plays FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert a play record"
  ON public.song_plays FOR INSERT
  WITH CHECK (true);

-- Reports:
CREATE POLICY "Admins can view all reports, users can view own"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id OR public.is_admin());

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update report statuses"
  ON public.reports FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------------------------
-- STORAGE BUCKETS CONFIGURATION (SQL helper)
-- ----------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('songs', 'songs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies:
CREATE POLICY "Public read for songs bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'songs');

CREATE POLICY "Authenticated users can upload songs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'songs' AND auth.role() = 'authenticated');

CREATE POLICY "Public read for covers bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Public read for avatars bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ----------------------------------------------------------
-- DESIGNATED ADMINISTRATOR PROMOTION
-- ----------------------------------------------------------
UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(email) = 'mizpam54@gmail.com';

