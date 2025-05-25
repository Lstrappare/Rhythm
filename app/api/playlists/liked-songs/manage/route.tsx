// app/api/playlists/liked-songs/manage/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'; // Para proteger la ruta y obtener userId
import docClient from '@/lib/dynamodb';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'; // GetCommand para verificar si la canción ya está

const PLAYLISTS_TABLE_NAME = 'Playlists';
const LIKED_SONGS_PLAYLIST_ID = '__LIKED_SONGS__'; // ID especial para la playlist "Liked Songs"

// Interfaz para la canción que esperamos en el request y guardaremos
interface PlaylistSongInput {
  id: string;
  nombre: string;
  artista: string;
  album: string;
  foto: string;
  pista: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const songData = (await req.json()) as PlaylistSongInput;
    if (!songData || !songData.id) {
      return NextResponse.json({ error: 'Faltan datos de la canción' }, { status: 400 });
    }

    // Paso 1: Obtener la playlist "Liked Songs" actual para ver si la canción ya existe
    const getParams = {
      TableName: PLAYLISTS_TABLE_NAME,
      Key: {
        usuario_id: userId,
        playlist_id: LIKED_SONGS_PLAYLIST_ID,
      },
    };
    const currentPlaylistData = await docClient.send(new GetCommand(getParams));
    const currentSongs: PlaylistSongInput[] = currentPlaylistData.Item?.canciones || [];

    let newSongsArray: PlaylistSongInput[];
    let actionTaken: 'added' | 'removed';

    const songExistsIndex = currentSongs.findIndex(s => s.id === songData.id);

    if (songExistsIndex > -1) {
      // La canción existe, la quitamos (quitar like)
      newSongsArray = currentSongs.filter(s => s.id !== songData.id);
      actionTaken = 'removed';
    } else {
      // La canción no existe, la añadimos (dar like)
      newSongsArray = [...currentSongs, songData];
      actionTaken = 'added';
    }

    // Paso 2: Actualizar la playlist (o crearla si es la primera canción)
    const updateParams = {
      TableName: PLAYLISTS_TABLE_NAME,
      Key: {
        usuario_id: userId,
        playlist_id: LIKED_SONGS_PLAYLIST_ID,
      },
      UpdateExpression:
        'SET canciones = :songs, nombre_playlist = if_not_exists(nombre_playlist, :playlistName), es_liked_songs = if_not_exists(es_liked_songs, :isLikedSongs), foto_portada = if_not_exists(foto_portada, :defaultCover)',
      ExpressionAttributeValues: {
        ':songs': newSongsArray,
        ':playlistName': 'Liked Songs',
        ':isLikedSongs': true,
        ':defaultCover': newSongsArray.length > 0 ? newSongsArray[0].foto : '/img/default_playlist_cover.png', // Usa la foto de la primera canción o una por defecto
      },
      ReturnValues: 'UPDATED_NEW', // O 'ALL_NEW' para obtener todo el item
    };

    await docClient.send(new UpdateCommand(updateParams));

    return NextResponse.json({
      message: `Canción ${actionTaken === 'added' ? 'agregada a' : 'quitada de'} "Liked Songs"`,
      action: actionTaken,
      songId: songData.id,
      // updatedPlaylist: result.Attributes // Si usas ReturnValues que devuelvan el item
    });

  } catch (error) {
    console.error('Error al gestionar "Liked Songs":', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
  }
}