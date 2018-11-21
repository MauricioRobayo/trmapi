# TRMAPI

JSON API para consultar la [Tasa Representativa del Mercado](http://www.banrep.gov.co/es/tasa-cambio-del-peso-colombiano-trm) (TRM) en el [Servicio Web](https://www.superfinanciera.gov.co/inicio/60819) de la Superintendencia Financiera de Colombia (SFC).

Esta API es una función Lambda que se ejecuta en AWS y a la cual se accede por API Gateway, lo que garantiza su estabilidad, escalabilidad y rapidez.

La función lambda solicita la información al servicio web de la SFC y almacena el valor de la TRM en una tabla de Dynamodb.

Al usar esta API se reduce la carga sobre los servidores de la SFC y se garantiza la disponibilidad del servicio.

## Uso

El servicio es gratuito y de libre acceso. Todas las solicitudes se hacen usando el método `GET` especificando el recurso solicitado a la url base:

    https://api.trmapi.com/

Por ejemplo, para acceder a la información de la TRM del día 11 de octubre de 2018:

```http
GET https://api.trmapi.com/2018-03-29 HTTP/1.1

{
"value": 2780.47,
"date": "2018-03-29",
}
```

Todos los endpoints aceptan el parámetro `validity` que indica si se desea consultar el rango de validez de un dato:

```http
GET https://api.trmapi.com/2018-03-29?validity=true HTTP/1.1

{
"value": 2780.47,
"date": "2018-03-29",
"validityTo": "2018-04-02T00:00:00-05:00",
"validityFrom": "2018-03-29T00:00:00-05:00"
}
```

### Endpoints

Obtener la información más reciente de la tasa de cambio:

```http
GET https://api.trmapi.com/latest HTTP/1.1
```

Obtener un valor de una fecha en específico de la tasa de cambio a partir de `2013-01-01`:

```http
GET https://api.trmapi.com/2015-09-21 HTTP/1.1
```

Obtener los valores diarios de la tasa de cambio entre dos fechas. Se limita a un máximo de 365 días devueltos y la fecha mínima es `2013-01-01`:

```http
GET https://api.trmapi.com/timeseries?start_date=2017-01-01&end_date=2017-12-31 HTTP/1.1
```

### Errores

Cuando se solicita un recurso que no está disponible o hay un error en la API por alguna otra razón, se devuelve el código del error en los encabezados de la respuesta acompañado de un objecto JSON indicando el mensaje del error.

| Código | Descripción                                                  |
| ------ | ------------------------------------------------------------ |
| 404    | No se encontró la fecha solicitada                           |
| 422    | La fecha solicitada no es una fecha válida                   |
| 502    | Se ha recibido una respuesta inválida del servidor de la SFC |
| 504    | Se agotó el tiempo de respuesta para el servidor de la SFC   |

Ejemplo de una solicitud errónea:

```http
GET api.trmapi.com/2017-1-10 HTTP/1.1

HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": "La fecha solicitada debe ser una fecha válida en formato 'YYYY-MM-DD'. La fecha solicitada '2017-1-10' no es una fecha válida."
}
```

## Desplegar en AWS

Para desplegar la API se debe contar con:

- Cuenta de [Amazon Web Services](https://aws.amazon.com/es/) (AWS)
- [Credenciales de AWS](https://docs.aws.amazon.com/es_es/cli/latest/userguide/cli-config-files.html)
- [aws-cli](https://docs.aws.amazon.com/es_es/cli/latest/userguide/installing.html)
- [aws-sam-cli](https://docs.aws.amazon.com/es_es/lambda/latest/dg/sam-cli-requirements.html)

Una vez confirmados los requisitos anteriores se debe clonar el repositorio:

```shell
git clone https://github.com/archemiro/trmapi.git
```

Ingresar a la carpeta:

```shell
cd trmapi
```

Ejecutar el script `deploy`:

```shell
npm run deploy
```

Esto creará los siguientes recursos en la cuenata de AWS:

1. Tabla de DynamoDB
2. API Gateway
3. Función Lambda

Al final del script se mostrarán la información de los recursos creados, incluidos la url de la API (`ApiUrl`):

```json
[
  {
    "OutputKey": "DateApi",
    "OutputValue": "trmapi-DateApi-XXXXXXXXXXX"
  },
  {
    "OutputKey": "ApiUrl",
    "OutputValue": "https://XXXXXXXXX.execute-api.us-east-1.amazonaws.com/Prod/latest"
  },
  {
    "OutputKey": "TrmTable",
    "OutputValue": "trmapi-TrmTable-XXXXXXXXXXX"
  }
]
```

Tenga en cuenta que la tabla de DynamoDB creada no contendrá la información histórica de la TRM por lo que el endpoint `timeseries` que permite consultar rangos históricos no proveerá datos.

Para llenar los valores históricos se pude ejecutar un script como el siguiente que llamará a la API para cada fecha desde `2013-01-01` hasta la fecha actual lo que hará que los datos se vayan guardando en la tabla de DynamoDB:

```bash
#!/bin/bash

dCurrent="2013-01-01"
dEnd="$(date -I)"
until [[ $dCurrent > $dEnd ]]; do
        printf "Writing $(date -Im) "
        curl -s {{ApiUrl}}/$dCurrent | jq -r '"\(.date) \(.value)"'
        d=$(date -I -d "$dCurrent + 1 day")
        sleep 1
done
```

Se escribe un dato cada segundo ya que la `WCU` de la tabla creada es `1`. Se puede aumentar moficando la definición de la tabla en la [plantilla de SAM](template.yaml).

También puede cargar los datos deel archivo [`csv`](dynamodb/data.csv) que se encuentra en la carpeta `dynamodb` directamente a la tabla. Este archivo es usado para cargar la base de datos local para desarrollo y se proporciona el el script [bootstrap-remote.js] para cargar los datos en la tabla de AWS (asegúrese de usar el nombre de la tabla correspondiente):

```js
node dynamodb/bootstrap-remote.js
```

Puede consultar el nombre de la tabla creada ejecutando `npm run outputs`.

## Desarrollo

Instalar las dependencias:

````sh
npm i
```

Ejecutar el script `start:dev`:

```shell
npm run start:dev
```

Este script lanzará un contenedor con una base de datos de DynamoDB local, cargará en la tabla `trm` los datos de la trm, y usará `sam local` para crear una `API Gateway` local a la que se carga la función Lambda.

Se puede acceder a la API en desarrollo en `http://localhost:3000` y allí a cada uno de los endpoints disponibles, por ejemplo:

```http
GET http://localhost:3000/latest HTTP/1.1
```

## Licencia

[MIT](LICENSE)

Hecho en ![Bandera de Colombia](https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/16px-Flag_of_Colombia.svg.png) con mucho ☕.
````
