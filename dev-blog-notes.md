Este proyecto está basado en una muy buena práctica de John Carmack. Uno de los mejores programadores de la historia. John Carmack publicaba notas de lo que iba desarrollando desde que empezó a crear videojuegos en los 80’s. Algunas notas parecían mas como un ToDo list de lo que iba terminando, algunas explicaban como programo cosas muy complejas.
https://github.com/oliverbenns/john-carmack-plan/blob/master/archive/1996-04-16.md

Hoy tenemos que crear un decentralized dev notes.

Paso 1: Crear y deployear un blog de dev notes donde pueda agregar notas de desarrollo de lo que van creando.

El blog además de tener su vista de lista y detalle de cada nota require tener 3 endpoints:
Endpoint the metadata: En archivo JSON con metadata de donde esta la lista del file. Sus datos de contacto(nombre, cuenta de github, cuenta linkedin y otros lugares que les gustaría que se muestran en su perfil), avatar. 
Endpoint de lista de notas.
Endpoint con la nota, la nota tiene que ser en formato Markdown con Frontmatter.

Cuando termines en paso 1 comparte la url de tu metadata para que otros desarrolladores puedan consumirlo. Ve publicando notas de lo que vayas creando. 

Al final del evento, tiene que tener por lo menos 5 notas publicadas en su blog. Los blogs haganlos lo más vintage hacker like posible.

Paso 2: Crear un cliente de los dev notes de otros devs. El cliente tiene el objetivo de permitir estar al día de lo que crean dichos devs de ahora en adelante. 

Idealmente creamos repo de blog(o varios) y un cliente que nos permita tener DevNotes como comunidad de ahora en adelante. 

Especificación JSON - Metadata de Perfil
Aquí está la especificación completa del JSON para el endpoint de metadata:
json{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User Profile Metadata",
  "type": "object",
  "required": ["version", "profile", "fileList"],
  "properties": {
    "version": {
      "type": "string",
      "description": "Versión del esquema de metadata",
      "example": "1.0.0"
    },
    "profile": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": {
          "type": "string",
          "description": "Nombre completo del usuario",
          "minLength": 1,
          "example": "Juan Pérez"
        },
        "avatar": {
          "type": "string",
          "format": "uri",
          "description": "URL de la imagen de avatar del usuario",
          "example": "https://example.com/avatar.jpg"
        },
        "contact": {
          "type": "object",
          "properties": {
            "github": {
              "type": "string",
              "description": "Username de GitHub",
              "example": "juanperez"
            },
            "linkedin": {
              "type": "string",
              "description": "URL o username de LinkedIn",
              "example": "https://linkedin.com/in/juanperez"
            },
            "email": {
              "type": "string",
              "format": "email",
              "description": "Correo electrónico de contacto",
              "example": "juan@example.com"
            },
            "twitter": {
              "type": "string",
              "description": "Handle de Twitter/X",
              "example": "@juanperez"
            },
            "website": {
              "type": "string",
              "format": "uri",
              "description": "Sitio web personal",
              "example": "https://juanperez.dev"
            },
            "other": {
              "type": "array",
              "description": "Otros enlaces de perfil adicionales",
              "items": {
                "type": "object",
                "required": ["platform", "url"],
                "properties": {
                  "platform": {
                    "type": "string",
                    "description": "Nombre de la plataforma",
                    "example": "Medium"
                  },
                  "url": {
                    "type": "string",
                    "format": "uri",
                    "description": "URL del perfil",
                    "example": "https://medium.com/@juanperez"
                  },
                  "label": {
                    "type": "string",
                    "description": "Etiqueta personalizada para mostrar",
                    "example": "Mi Blog"
                  }
                }
              }
            }
          }
        }
      }
    },
    "fileList": {
      "type": "object",
      "required": ["url"],
      "properties": {
        "url": {
          "type": "string",
          "format": "uri",
          "description": "URL donde se encuentra el archivo con la lista de archivos",
          "example": "https://example.com/api/files.json"
        },
        "format": {
          "type": "string",
          "enum": ["json", "xml", "csv"],
          "description": "Formato del archivo de lista",
          "default": "json"
        },
        "lastUpdated": {
          "type": "string",
          "format": "date-time",
          "description": "Fecha y hora de última actualización",
          "example": "2025-11-08T10:30:00Z"
        }
      }
    }
  }
}
Ejemplo de JSON válido:
json{
  "version": "1.0.0",
  "profile": {
    "name": "María González",
    "avatar": "https://avatars.githubusercontent.com/mariagonzalez",
    "contact": {
      "github": "mariagonzalez",
      "linkedin": "https://linkedin.com/in/mariagonzalez",
      "email": "maria@example.com",
      "twitter": "@mariagonzalez",
      "website": "https://mariagonzalez.dev",
      "other": [
        {
          "platform": "YouTube",
          "url": "https://youtube.com/@mariagonzalez",
          "label": "Mi canal de tech"
        },
        {
          "platform": "Dev.to",
          "url": "https://dev.to/mariagonzalez"
        }
      ]
    }
  },
  "fileList": {
    "url": "https://api.example.com/users/maria/files.json",
    "format": "json",
    "lastUpdated": "2025-11-08T15:45:30Z"
  }
}
Esta especificación incluye todos los elementos solicitados: información de contacto completa (GitHub, LinkedIn y otros perfiles), avatar, y la ubicación del archivo con la lista de archivos.
