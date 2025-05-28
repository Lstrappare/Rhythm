// app/api/playlists/create/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import docClient from '@/lib/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs de playlist únicos

const PLAYLISTS_TABLE_NAME = 'Playlists';

interface PlaylistSongData { // Debe coincidir con la que se envía desde el modal
  id: string;
  nombre: string;
  artista: string;
  album: string;
  foto: string;
  pista: string;
}

interface CreatePlaylistPayload {
  nombre_playlist: string;
  canciones: PlaylistSongData[];
}

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { nombre_playlist, canciones } = (await req.json()) as CreatePlaylistPayload;

    if (!nombre_playlist || !canciones || canciones.length === 0) {
      return NextResponse.json({ error: 'Nombre de playlist y al menos una canción son requeridos' }, { status: 400 });
    }

    const newPlaylistId = uuidv4(); // Genera un ID único para la nueva playlist
    const fotoPortada = canciones[0]?.foto || '/img/default_playlist_cover.png'; // Foto de la primera canción o una por defecto

    const playlistItem = {
      usuario_id: userId,
      playlist_id: newPlaylistId, // Clave de ordenación
      nombre_playlist: nombre_playlist,
      canciones: canciones,
      es_liked_songs: false, // No es la playlist de "Liked Songs"
      foto_portada: fotoPortada,
      fecha_creacion: new Date().toISOString(), // Opcional: fecha de creación
      // ... otros campos que puedas querer, como 'descripcion', 'publica', etc.
    };

    const params = {
      TableName: PLAYLISTS_TABLE_NAME,
      Item: playlistItem,
    };

    await docClient.send(new PutCommand(params));

    return NextResponse.json({ message: 'Playlist creada exitosamente', playlist: playlistItem }, { status: 201 });

  } catch (error) {
    console.error('Error al crear playlist:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
  }
}