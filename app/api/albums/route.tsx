import { NextResponse } from 'next/server';
import docClient from '@/lib/dynamodb'; // Reutilizamos el cliente DynamoDB
import { BatchWriteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'Albumes';
const albumsToUpload = [
  {
    "id_album": 1,
    "nombre_album": "Thriller",
    "artista": "Michael Jackson",
    "año_publicación": 1982,
    "género": "Pop, funk, R&B, rock",
    "foto_portada": "/img/MichaelJackson.png",
    "canciones": [
      { "id_cancion": 11, "nombre": "Wanna Be Startin' Somethin'", "compositor": "Michael Jackson", "género": "Post-disco, funk, Afropop", "pista": "/songs/11. Wanna Be Startin' Somethin' - Michael Jackson.mp3" },
      { "id_cancion": 12, "nombre": "Baby Be Mine", "compositor": "Rod Temperton", "género": "Post-disco, funk", "pista": "/songs/12. Baby Be Mine - Michael Jackson.mp3" },
      { "id_cancion": 13, "nombre": "The Girl Is Mine", "compositor": "Michael Jackson", "género": "Pop", "pista": "/songs/13. The Girl Is Mine - Michael Jackson.mp3" },
      { "id_cancion": 14, "nombre": "Thriller", "compositor": "Rod Temperton", "género": "Pop, funk", "pista": "/songs/14. Thriller - Michael Jackson.mp3" },
      { "id_cancion": 15, "nombre": "Beat It", "compositor": "Michael Jackson", "género": "Hard rock, dance-rock, funk rock", "pista": "/songs/15. Beat It - Michael Jackson.mp3" },
      { "id_cancion": 16, "nombre": "Billie Jean", "compositor": "Michael Jackson", "género": "Funk, dance-pop, R&B", "pista": "/songs/16. Billie Jean - Michael Jackson.mp3" },
      { "id_cancion": 17, "nombre": "Human Nature", "compositor": "Steve Porcaro, John Bettis", "género": "Soft rock, R&B", "pista": "/songs/17. Human Nature - Michael Jackson.mp3" },
      { "id_cancion": 18, "nombre": "P.Y.T. (Pretty Young Thing)", "compositor": "James Ingram, Quincy Jones", "género": "R&B, funk", "pista": "/songs/18. P.Y.T. (Pretty Young Thing) - Michael Jackson.mp3" },
      { "id_cancion": 19, "nombre": "The Lady in My Life", "compositor": "Rod Temperton", "género": "Pop, soul, quiet storm", "pista": "/songs/19. The Lady in My Life - Michael Jackson.mp3" }
    ]
  }
  // ... puedes añadir más álbumes aquí
];

export async function POST() {
  const putRequests = albumsToUpload.map(album => ({
    PutRequest: {
      Item: {
        "id": String(album.id_album), // PK para la tabla 'Albumes' (String)
        "nombre_album": album.nombre_album,
        "artista": album.artista,
        "año_publicación": album.año_publicación, // Se guarda como Number
        "género": album.género, // Corregido a 'género' con tilde
        "foto_portada": album.foto_portada,
        "canciones": album.canciones, // La lista de canciones se guarda directamente
        "id_album_original": album.id_album // Opcional: guardar el ID numérico original
      }
    }
  }));

  if (putRequests.length === 0) {
    return NextResponse.json({ message: 'No albums to upload' }, { status: 400 });
  }

  const params = {
    RequestItems: {
      [TABLE_NAME]: putRequests.slice(0, 25) // Límite de BatchWrite es 25
    }
  };

  try {
    await docClient.send(new BatchWriteCommand(params));
    return NextResponse.json({ message: `Successfully uploaded ${putRequests.length} albums!` });
  } catch (error) {
    console.error('Error uploading albums to DynamoDB:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Error uploading albums', error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await docClient.send(new ScanCommand(params));
    return NextResponse.json(data.Items || []);
  } catch (error) {
    console.error('Error fetching albums from DynamoDB:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Error fetching albums', error: errorMessage }, { status: 500 });
  }
}