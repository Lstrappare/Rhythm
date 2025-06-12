// app/api/songs/route.ts
import { NextResponse } from 'next/server';
import docClient from '@/lib/dynamodb'; 
import { BatchWriteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'Canciones'; 

const songsToUpload = [
{
    "id_cancion": 20,
    "Nombre de la canción": "Smells Like Teen Spirit",
    "Álbum": "Nevermind",
    "Género": "Grunge, alternative rock",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain, Krist Novoselic, Dave Grohl",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/20. Smells Like Teen Spirit - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 21,
    "Nombre de la canción": "In Bloom",
    "Álbum": "Nevermind",
    "Género": "Grunge, alternative rock",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/21. In Bloom - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 22,
    "Nombre de la canción": "Come as You Are",
    "Álbum": "Nevermind",
    "Género": "Grunge, alternative rock",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/22. Come As You Are - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 23,
    "Nombre de la canción": "Breed",
    "Álbum": "Nevermind",
    "Género": "Grunge, punk rock",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/23. Breed - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 24,
    "Nombre de la canción": "Lithium",
    "Álbum": "Nevermind",
    "Género": "Grunge",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/24. Lithium - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 25,
    "Nombre de la canción": "Polly",
    "Álbum": "Nevermind",
    "Género": "Acoustic rock, grunge",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/25. Polly - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 26,
    "Nombre de la canción": "Territorial Pissings",
    "Álbum": "Nevermind",
    "Género": "Hardcore punk, grunge",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/26. Territorial Pissings - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 27,
    "Nombre de la canción": "Drain You",
    "Álbum": "Nevermind",
    "Género": "Grunge",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/27. Drain You - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 28,
    "Nombre de la canción": "Lounge Act",
    "Álbum": "Nevermind",
    "Género": "Grunge",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/28. Lounge Act - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 29,
    "Nombre de la canción": "Stay Away",
    "Álbum": "Nevermind",
    "Género": "Grunge, punk rock",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/29. Stay Away - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 30,
    "Nombre de la canción": "On a Plain",
    "Álbum": "Nevermind",
    "Género": "Grunge, alternative rock",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/30. On A Plain - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
  {
    "id_cancion": 31,
    "Nombre de la canción": "Something in the Way",
    "Álbum": "Nevermind",
    "Género": "Acoustic rock, grunge",
    "Año de publicación": 1991,
    "Artista": "Nirvana",
    "Compositor": "Kurt Cobain",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/31. Something In The Way - Nirvana.mp3",
    "foto": "/img/Nevermind.png"
  },
];

/**
 * POST handler para subir canciones a DynamoDB.
 */
export async function POST() {
  const putRequests = songsToUpload.map(song => ({
    PutRequest: {
      Item: {
        "id": String(song.id_cancion), // Clave Primaria (String) para la tabla 'Canciones'
        "Nombre de la canción": song["Nombre de la canción"],
        "Álbum": song["Álbum"],
        "Género": song["Género"],
        "Año de publicación": song["Año de publicación"],
        "Artista": song["Artista"],
        "Compositor": song["Compositor"],
        "Idioma": song["Idioma"],
        "País de origen": song["País de origen"],
        "pista": song.pista,
        "foto": song.foto,
        "id_cancion_original": song.id_cancion 
      }
    }
  }));

  if (putRequests.length === 0) {
    return NextResponse.json({ message: 'No songs to upload' }, { status: 400 });
  }

  const params = {
    RequestItems: {
      [TABLE_NAME]: putRequests.slice(0, 25) // Procesamos hasta 25 items
    }
  };

  try {
    await docClient.send(new BatchWriteCommand(params));
    return NextResponse.json({ message: `Successfully uploaded ${putRequests.length} songs!` });
  } catch (error) {
    console.error('Error uploading songs to DynamoDB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error uploading songs', error: errorMessage }, { status: 500 });
  }
}

/**
 * GET handler para obtener todas las canciones desde DynamoDB.
 */
export async function GET() {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await docClient.send(new ScanCommand(params));
    return NextResponse.json(data.Items || []);
  } catch (error) {
    console.error('Error fetching songs from DynamoDB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching songs', error: errorMessage }, { status: 500 });
  }
}