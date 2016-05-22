const Os = require('os');
const Fs = require('fs');
const Hapi = require('hapi');
const Ip = require('ip');

const server = new Hapi.Server();
server.connection({ port: 8080 });

try
{
    Fs.accessSync('/etc/letsencrypt/live/chained.pem', Fs.R_OK);
    var tls = {
      key: Fs.readFileSync('/etc/letsencrypt/live/domain.key'),
      cert: Fs.readFileSync('/etc/letsencrypt/live/chained.pem')
    };
    server.connection({address: '0.0.0.0', port: 44344, tls: tls });

}
catch(err)
{
    console.log('Certificates not found... booting reverse-proxy without https');
}

server.register({
    register: require('h2o2')
}, function (err) {
 
    if (err) {
        console.log('Failed to load h2o2');
        process.exit();
    }

    var networkInterfaces = Os.networkInterfaces();
    var dockerSubnet = Ip.mask(networkInterfaces['eth0'][0]['address'], networkInterfaces['eth0'][0]['netmask']);
    
    server.method('getRequestSubnet', (request, reply) => {
        reply(Ip.mask(request.info.remoteAddress, networkInterfaces['eth0'][0]['netmask']));
    });
    
    server.route(require('./routes.js').concat([
        {
            method: 'GET',
            path: '/.well-known/acme-challenge/{path*}',
            handler: {
                proxy: {
                    host: 'letsencrypt-server',
                    port: 8080,
                    protocol: 'http',
                    passThrough: true
                }
            }
        },
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
        console.log('Reverse-proxy running');
    });
    
    process.on('SIGTERM', () => {
        console.log('Sigterm received. Terminating reverse-proxy...');
        server.stop((err) => {
            process.exit(0);
        });
    });
});