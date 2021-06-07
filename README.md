# Sistemas Distribuidos Practica 4
#### Escuela Superior de Computo - IPN, Mexico

## Como usarlo

Para clonar y usar el repo necesitas [Git](https://git-scm.com) y [Node.js](https://nodejs.org/en/download/) (el cual viene con [npm](http://npmjs.com)) instalados en tu ordenador. Desde la linea de comandos:

```bash
# Clone this repository
git clone 
# Go into the repository
cd 
# Install dependencies
npm install
```
### Correr servidor de tiempo
Dado que es el servidor que maneja la sincronia de tiempos entre los servidores y usuarios, primer deberas de correrlo.
En una terminal con el comando:
```bash
npm run start:time
```

### Correr cliente - servidor
Primero deberas correr el servidor, para eso en una terminal correras el comando
```bash
npm run start:server
```

Una vez activo el servidor, podras correr un cliente, para eso en otra terminal correras el comando.
```bash
npm run start:client
```
## License

[MIT (Public Domain)](LICENSE.md)

