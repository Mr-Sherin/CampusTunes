-- Supabase Schema for CampusTunes

-- Enums
CREATE TYPE user_role AS ENUM ('listener', 'artist', 'admin');
CREATE TYPE song_status AS ENUM ('pending', 'approved', 'rejected');

-- Users (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'listener',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artists (Profile for artists)
CREATE TABLE public.artists (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  banner_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  total_plays BIGINT DEFAULT 0
);

-- Albums
CREATE TABLE public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  cover_url TEXT,
  release_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Songs
CREATE TABLE public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  status song_status DEFAULT 'pending',
  play_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists
CREATE TABLE public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist Songs (Many-to-Many)
CREATE TABLE public.playlist_songs (
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (playlist_id, song_id)
);

-- Likes
CREATE TABLE public.likes (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, song_id)
);

-- Follows
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, artist_id)
);

-- Listening History
CREATE TABLE public.listening_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Can be refined later)

-- Users can read all users, but only update themselves
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Artists are viewable by everyone
CREATE POLICY "Artists are viewable by everyone" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own profile" ON public.artists FOR ALL USING (auth.uid() = id);

-- Songs are viewable by everyone (if approved) or by the artist/admin
CREATE POLICY "Approved songs are viewable by everyone" ON public.songs FOR SELECT USING (status = 'approved');
CREATE POLICY "Artists can view their own songs regardless of status" ON public.songs FOR SELECT USING (auth.uid() = artist_id);
CREATE POLICY "Artists can insert own songs" ON public.songs FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update own songs" ON public.songs FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Artists can delete own songs" ON public.songs FOR DELETE USING (auth.uid() = artist_id);

-- Playlists are viewable if public or owned by user
CREATE POLICY "Playlists are viewable if public or owner" ON public.playlists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own playlists" ON public.playlists FOR ALL USING (auth.uid() = user_id);

-- Create a trigger to automatically create a user record when they sign up via Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
