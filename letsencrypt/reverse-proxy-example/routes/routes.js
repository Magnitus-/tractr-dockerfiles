module.exports = [
{
    method: 'GET',
    path: '/.well-known/acme-challenge/{path*}',
    handler: {
        proxy: {
            host: 'letsencrypt-server',
            port: 8080,
            protocol: 'http',
            passThrough: true,
            redirects: 5
        }
    }
}];
