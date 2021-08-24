import Fastify, { FastifyInstance } from 'fastify';
import Path from 'path';
import Fs from 'fs';

export const autoPrefix: string = '/';

export default async (router: FastifyInstance) => {
    router.get<{ 
        Params: {
            server: string;
            version: string;
            extension: string;
        };
    }>('/:server/:version/:extension', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    server: {
                        type: 'string',
                        enum: ['forge'],
                    },
                    version: {
                        type: 'string',
                    },
                    extension: {
                        type: 'string',
                       
                    },
                },
                required: ['server', 'version', 'extension'],
            },
        },
    }, async (request, reply) => {
        const server = request.params.server;
        const version = request.params.version;
        const type = request.params.extension;

        if (!Fs.existsSync(Path.join('public', server, `${version}.${type}`))) {
            return reply.status(404).send({
                status: 404,
                data: null,
                message: 'Cannot be found.'
            });
        }

        const file = Fs.createReadStream(Path.join('public', server, `${version}.${type}`), 'utf-8');

        reply.send(file);
    });
};