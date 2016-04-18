'use strict';

const Hapi = require('hapi');
const Inert = require('inert');

const server = new Hapi.Server();
server.connection({ port: 8080 });

server.register(Inert, () => {});

server.route([
{ 
   method: 'GET', 
   path: '/.well-known/acme-challenge/{param*}', 
   handler: { 
                directory: { 
                    path: '/home/node-app/challenge' 
                }
            }
}]);

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
