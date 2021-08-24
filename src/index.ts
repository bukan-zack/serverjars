import Fastify, { FastifyInstance } from 'fastify';
import FastifyStatic from 'fastify-static';
import FastifyAutoload from 'fastify-autoload';
import Path from 'path';
import Forge from '@/servers/forge';

const forge: Forge = new Forge();

const Server: FastifyInstance = Fastify({ logger: true });

Server.register(FastifyAutoload, {
    dir: Path.join(__dirname, 'routers'),
    options: {
        prefix: '/api'
    },
});

Server.listen(3050, '0.0.0.0').then(() => {
    console.log('running!');
});