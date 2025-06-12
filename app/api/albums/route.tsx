import { NextResponse } from 'next/server';
import docClient from '@/lib/dynamodb'; // Reutilizamos el cliente DynamoDB
import { BatchWriteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'Albumes';
const albumsToUpload = [
{
  "id_album": 2,
  "nombre_album": "Nevermind",
  "artista": "Nirvana",
  "año_publicación": 1991,
  "género": "Grunge, alternative rock",
  "foto_portada": "/img/Nevermind.png",
  "canciones": [
    { "id_cancion": 20, "nombre": "Smells Like Teen Spirit", "compositor": "Kurt Cobain, Krist Novoselic, Dave Grohl", "género": "Grunge, alternative rock", "pista": "/songs/20. Smells Like Teen Spirit - Nirvana.mp3" },
    { "id_cancion": 21, "nombre": "In Bloom", "compositor": "Kurt Cobain", "género": "Grunge, alternative rock", "pista": "/songs/21. In Bloom - Nirvana.mp3" },
    { "id_cancion": 22, "nombre": "Come as You Are", "compositor": "Kurt Cobain", "género": "Grunge, alternative rock", "pista": "/songs/22. Come As You Are - Nirvana.mp3" },
    { "id_cancion": 23, "nombre": "Breed", "compositor": "Kurt Cobain", "género": "Grunge, punk rock", "pista": "/songs/23. Breed - Nirvana.mp3" },
    { "id_cancion": 24, "nombre": "Lithium", "compositor": "Kurt Cobain", "género": "Grunge", "pista": "/songs/24. Lithium - Nirvana.mp3" },
    { "id_cancion": 25, "nombre": "Polly", "compositor": "Kurt Cobain", "género": "Acoustic rock, grunge", "pista": "/songs/25. Polly - Nirvana.mp3" },
    { "id_cancion": 26, "nombre": "Territorial Pissings", "compositor": "Kurt Cobain", "género": "Hardcore punk, grunge", "pista": "/songs/26. Territorial Pissings - Nirvana.mp3" },
    { "id_cancion": 27, "nombre": "Drain You", "compositor": "Kurt Cobain", "género": "Grunge", "pista": "/songs/27. Drain You - Nirvana.mp3" },
    { "id_cancion": 28, "nombre": "Lounge Act", "compositor": "Kurt Cobain", "género": "Grunge", "pista": "/songs/28. Lounge Act - Nirvana.mp3" },
    { "id_cancion": 29, "nombre": "Stay Away", "compositor": "Kurt Cobain", "género": "Grunge, punk rock", "pista": "/songs/29. Stay Away - Nirvana.mp3" },
    { "id_cancion": 30, "nombre": "On a Plain", "compositor": "Kurt Cobain", "género": "Grunge, alternative rock", "pista": "/songs/30. On A Plain - Nirvana.mp3" },
    { "id_cancion": 31, "nombre": "Something in the Way", "compositor": "Kurt Cobain", "género": "Acoustic rock, grunge", "pista": "/songs/31. Something In The Way - Nirvana.mp3" }
  ]
}
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