// app/api/playlists/liked-songs/manage/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import docClient from '@/lib/dynamodb';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { NextRequest } from 'next/server';
const PLAYLISTS_TABLE_NAME = 'Playlists';
const LIKED_SONGS_PLAYLIST_ID = '__LIKED_SONGS__';

interface PlaylistSong {
  id: string;
  nombre: string;
  artista: string;
  album: string;
  foto: string;
  pista: string;
}

const DEFAULT_LIKED_SONGS_NAME = 'Liked Songs';
const DEFAULT_LIKED_SONGS_IMAGE = '/img/LikedSongs.png';

// Tu función POST existente (asegúrate que use la interfaz PlaylistSong consistentemente)
export async function POST(req: NextRequest) {
  
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const songData = (await req.json()) as PlaylistSong; // Usar PlaylistSong
    // ... (resto de tu lógica POST como la tenías, usando PlaylistSong) ...
    // Asegúrate que songData tenga todos los campos de PlaylistSong
    const getParams = {
      TableName: PLAYLISTS_TABLE_NAME,
      Key: { usuario_id: userId, playlist_id: LIKED_SONGS_PLAYLIST_ID },
    };
    const currentPlaylistData = await docClient.send(new GetCommand(getParams));
    const currentSongs: PlaylistSong[] = currentPlaylistData.Item?.canciones || [];
    let newSongsArray: PlaylistSong[];
    let actionTaken: 'added' | 'removed';
    const songExistsIndex = currentSongs.findIndex(s => s.id === songData.id);

    if (songExistsIndex > -1) {
      newSongsArray = currentSongs.filter(s => s.id !== songData.id);
      actionTaken = 'removed';
    } else {
      newSongsArray = [...currentSongs, songData];
      actionTaken = 'added';
    }
    const updateParams = {
      TableName: PLAYLISTS_TABLE_NAME,
      Key: { usuario_id: userId, playlist_id: LIKED_SONGS_PLAYLIST_ID },
      UpdateExpression: 'SET canciones = :songs, nombre_playlist = if_not_exists(nombre_playlist, :pn), es_liked_songs = if_not_exists(es_liked_songs, :els), foto_portada = if_not_exists(foto_portada, :fp)',
      ExpressionAttributeValues: {
        ':songs': newSongsArray,
        ':pn': DEFAULT_LIKED_SONGS_NAME,
        ':els': true,
        ':fp': DEFAULT_LIKED_SONGS_IMAGE,
      },
      ReturnValues: 'UPDATED_NEW' as const,
    };
    await docClient.send(new UpdateCommand(updateParams));
    return NextResponse.json({ message: `Canción ${actionTaken}`, action: actionTaken, songId: songData.id });

  } catch (error) {
    console.error('Error en POST /api/playlists/liked-songs/manage:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
  
}

// NUEVA función GET para obtener los IDs de las canciones likeadas
export async function GET(req: NextRequest) {
  
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = {
      TableName: PLAYLISTS_TABLE_NAME,
      Key: {
        usuario_id: userId,
        playlist_id: LIKED_SONGS_PLAYLIST_ID,
      },
      ProjectionExpression: "canciones", // Solo necesitamos el array de canciones
    };

    const data = await docClient.send(new GetCommand(params));

    if (data.Item && data.Item.canciones) {
      const likedSongIds = (data.Item.canciones as PlaylistSong[]).map(song => song.id);
      return NextResponse.json(likedSongIds);
    } else {
      // No hay playlist "Liked Songs" o está vacía
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error al obtener Liked Songs (GET):', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
  }
  
}

