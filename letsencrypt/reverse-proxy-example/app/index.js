var Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 8080 });

server.register({
    register: require('h2o2')
}, function (err) {
 
    if (err) {
        console.log('Failed to load h2o2');
    }

    server.route(require('./routes.js'));
    
    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});