// app/api/me/favorite-albums/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import docClient from '@/lib/dynamodb'; 
import { PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { NextRequest } from 'next/server';

const USER_FAVORITE_ALBUMS_TABLE_NAME = 'UserFavoriteAlbums'; // Nombre de la nueva tabla

// Interfaz para los datos del álbum que se envían desde el cliente y se guardan
export interface FavoriteAlbumPayload {
  id: string; // ID original del álbum (será album_id en la tabla)
  nombre_album: string;
  artista: string;
  foto_portada: string;
  año_publicación: number; // O String, según tu definición
}

// GET: Obtener todos los álbumes favoritos del usuario
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = {
      TableName: USER_FAVORITE_ALBUMS_TABLE_NAME,
      KeyConditionExpression: 'usuario_id = :uid',
      ExpressionAttributeValues: {
        ':uid': userId,
      },
    };

    const { Items } = await docClient.send(new QueryCommand(params));
    
    // Mapear los items para que 'album_id' (de la BD) sea 'id' (para el cliente)
    const favoriteAlbums = Items?.map(item => ({
      id: item.album_id, // Importante este mapeo
      nombre_album: item.nombre_album,
      artista: item.artista,
      foto_portada: item.foto_portada,
      año_publicación: item.año_publicación,
      fecha_agregado: item.fecha_agregado, // Si se guarda
    })) || [];

    return NextResponse.json(favoriteAlbums);

  } catch (error) {
    console.error('Error GET /api/me/favorite-albums:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener álbumes favoritos' }, { status: 500 });
  }
}

// POST: Añadir o quitar un álbum de favoritos
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { albumData, action } = (await req.json()) as { albumData: FavoriteAlbumPayload, action: 'add' | 'remove' };

    if (!albumData || !albumData.id || !action) {
      return NextResponse.json({ error: 'Datos del álbum y acción son requeridos' }, { status: 400 });
    }

    if (action === 'add') {
      const itemToPut = {
        usuario_id: userId,        // PK
        album_id: albumData.id,    // SK
        nombre_album: albumData.nombre_album,
        artista: albumData.artista,
        foto_portada: albumData.foto_portada,
        año_publicación: albumData.año_publicación,
        fecha_agregado: new Date().toISOString(),
      };
      await docClient.send(new PutCommand({ TableName: USER_FAVORITE_ALBUMS_TABLE_NAME, Item: itemToPut }));
      return NextResponse.json({ message: 'Álbum añadido a favoritos', albumId: albumData.id, action: 'added' });

    } else if (action === 'remove') {
      await docClient.send(new DeleteCommand({
        TableName: USER_FAVORITE_ALBUMS_TABLE_NAME,
        Key: { usuario_id: userId, album_id: albumData.id },
      }));
      return NextResponse.json({ message: 'Álbum quitado de favoritos', albumId: albumData.id, action: 'removed' });
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error POST /api/me/favorite-albums:', error);
    return NextResponse.json({ error: 'Error interno del servidor al gestionar álbum favorito' }, { status: 500 });
  }
}