// app/api/playlists/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import docClient from '@/lib/dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { NextRequest } from 'next/server';

const PLAYLISTS_TABLE_NAME = 'Playlists';
const LIKED_SONGS_PLAYLIST_ID = '__LIKED_SONGS__';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = {
      TableName: PLAYLISTS_TABLE_NAME,
      KeyConditionExpression: 'usuario_id = :uid',
      ExpressionAttributeValues: {
        ':uid': userId,
      },
    };

    const { Items } = await docClient.send(new QueryCommand(params));
    
    // Ordenar: "Liked Songs" primero, luego las demás.
    const sortedItems = Items?.sort((a, b) => {
      if (a.playlist_id === LIKED_SONGS_PLAYLIST_ID) return -1;
      if (b.playlist_id === LIKED_SONGS_PLAYLIST_ID) return 1;
      return (a.nombre_playlist || '').localeCompare(b.nombre_playlist || '');
    }) || [];

    return NextResponse.json(sortedItems);

  } catch (error) {
    console.error('Error al obtener playlists:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
  }
}