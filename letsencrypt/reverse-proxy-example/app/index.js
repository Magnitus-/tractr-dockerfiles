const Os = require('os');
const Hapi = require('hapi');

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
    
    server.method('getLetsencryptIp', (request, reply) => {
        //dns.lookup('letsencrypt-daemon', function(err, address) {
            if(err)
            {
                reply(''); 
                return;
            }
            reply(address);
        //});
    });
    
    server.route(require('./routes.js').concat([
        {
            config: { 
                pre: [{ 
                    assign: 'IP', 
                    method: 'getLetsencryptIp'
                }] 
            },
            method: 'POST',
            path: '/certificates/reloading',
            handler: function(request, reply) {
                if(request.pre.IP == request.info.remoteAddress)
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