import sys
import json
from ytmusicapi import YTMusic

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def get_lyrics(query, video_id=None):
    ytm = YTMusic()
    lyrics_id = None
    track_title = query
    artist_name = ""

    # 1. Try with direct video_id watch playlist if provided
    if video_id:
        try:
            watch = ytm.get_watch_playlist(video_id)
            lyrics_id = watch.get('lyrics')
        except Exception:
            pass

    # 2. Search song if lyrics_id not found directly
    if not lyrics_id:
        try:
            results = ytm.search(query, filter="songs")
            if results and len(results) > 0:
                first = results[0]
                track_title = first.get('title', query)
                artists = first.get('artists', [])
                artist_name = ", ".join([a.get('name', '') for a in artists]) if artists else ""
                target_video_id = first.get('videoId')
                if target_video_id:
                    watch = ytm.get_watch_playlist(target_video_id)
                    lyrics_id = watch.get('lyrics')
        except Exception:
            pass

    if lyrics_id:
        try:
            data = ytm.get_lyrics(lyrics_id)
            if data and data.get('lyrics'):
                return {
                    "found": True,
                    "source": data.get('source') or "YouTube Music / LyricFind",
                    "title": track_title,
                    "artist": artist_name,
                    "lyrics": data.get('lyrics')
                }
        except Exception as e:
            return {"found": False, "error": str(e)}

    return {"found": False, "message": "Lyrics not available on YouTube Music"}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = sys.argv[1]
        vid = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "null" else None
        res = get_lyrics(query, vid)
        print(json.dumps(res, ensure_ascii=False))
    else:
        print(json.dumps({"found": False}))
