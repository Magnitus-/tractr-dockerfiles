const Os = require('os');
const Hapi = require('hapi');
const Ip = require('ip');

const server = new Hapi.Server();
server.connection({ port: 8080 });

server.register({
    register: require('h2o2')
}, function (err) {
 
    if (err) {
        console.log('Failed to load h2o2');
        process.exit();
    }
    
    var networkInterfaces = Os.networkInterfaces();
    var dockerSubnet = Ip.mask(networkInterfaces['docker0'][0]['address'], networkInterfaces['docker0'][0]['netmask']);
    
    server.method('getRequestSubnet', (request, reply) => {
        reply(Ip.mask(request.info.remoteAddress, networkInterfaces['docker0'][0]['netmask']));
    });

    server.route(require('./routes.js').concat([
        {
            config: { 
                pre: [{ 
                    assign: 'requestSubnet', 
                    method: 'getRequestSubnet'
                }] 
            },
            method: 'POST',
            path: '/certificates/reloading',
            handler: function(request, reply) {
                if(request.pre.requestSubnet == dockerSubnet)
                {
                    server.stop((err) => {
                        process.exit();
                    });
                    reply('').code(200);
                }
                else
                {
                    reply.code(403);
                }
            }
        }
    ]));
    
    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
