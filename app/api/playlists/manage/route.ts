// app/api/playlists/manage/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import docClient from '@/lib/dynamodb';
import { UpdateCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { NextRequest } from 'next/server';
const PLAYLISTS_TABLE_NAME = 'Playlists';
const LIKED_SONGS_PLAYLIST_ID_CONST = '__LIKED_SONGS__'; // Constante para ID de Liked Songs

// Interfaz para las canciones dentro de una playlist (asegúrate que coincida con lo que guardas)
interface PlaylistSong {
  id: string;
  nombre: string;
  artista?: string;
  album?: string;
  foto: string;
  pista: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { action, playlistId, songIdToRemove } = body;

    if (!action || !playlistId) {
      return NextResponse.json({ error: 'Acción y ID de playlist son requeridos' }, { status: 400 });
    }

    // Protección específica para la playlist "Liked Songs"
    if (playlistId === LIKED_SONGS_PLAYLIST_ID_CONST) {
      if (action === 'delete_playlist') {
        return NextResponse.json({ error: 'La playlist "Liked Songs" no se puede eliminar.' }, { status: 403 });
      }
      // La eliminación de canciones de "Liked Songs" se maneja por /api/playlists/liked-songs/manage
      if (action === 'remove_song_from_playlist') {
         return NextResponse.json({ error: 'Para quitar canciones de "Liked Songs", usa la función de "quitar like".' }, { status: 403 });
      }
    }

    if (action === 'remove_song_from_playlist') {
      if (!songIdToRemove) {
        return NextResponse.json({ error: 'ID de la canción a remover es requerido' }, { status: 400 });
      }

      // Obtener la playlist actual para modificar el array de canciones
      const getParams = {
        TableName: PLAYLISTS_TABLE_NAME,
        Key: { usuario_id: userId, playlist_id: playlistId },
      };
      const playlistData = await docClient.send(new GetCommand(getParams));

      if (!playlistData.Item || !playlistData.Item.canciones) {
        return NextResponse.json({ error: 'Playlist o canciones no encontradas' }, { status: 404 });
      }

      const currentSongs: PlaylistSong[] = playlistData.Item.canciones;
      const updatedSongs = currentSongs.filter(song => song.id !== songIdToRemove);

      // Actualizar la playlist con el nuevo array de canciones
      const updateParams = {
        TableName: PLAYLISTS_TABLE_NAME,
        Key: { usuario_id: userId, playlist_id: playlistId },
        UpdateExpression: 'SET canciones = :songs, foto_portada = :fp', // Actualizar foto_portada si la primera canción cambia
        ExpressionAttributeValues: {
          ':songs': updatedSongs,
          ':fp': updatedSongs.length > 0 ? updatedSongs[0].foto : '/img/default_playlist_cover.png',
        },
        ReturnValues: 'ALL_NEW', // Devuelve todo el item actualizado
      };
      const result = await docClient.send(new UpdateCommand(updateParams));
      return NextResponse.json({ 
        message: 'Canción removida de la playlist', 
        playlistId, 
        songIdRemoved: songIdToRemove,
        updatedPlaylist: result.Attributes 
      });

    } else if (action === 'delete_playlist') {
      const deleteParams = {
        TableName: PLAYLISTS_TABLE_NAME,
        Key: {
          usuario_id: userId,
          playlist_id: playlistId,
        },
      };
      await docClient.send(new DeleteCommand(deleteParams));
      return NextResponse.json({ message: 'Playlist eliminada exitosamente', playlistId });

    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error gestionando playlist:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
  }
}