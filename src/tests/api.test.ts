import assert from 'assert';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import request from 'supertest';

process.env.DB = 'sqlite3';
process.env.DATABASE_URL = path.join(os.tmpdir(), `dn-server-test-${process.pid}-${Date.now()}.sqlite`);
process.env.API_URL = 'http://test.local';

const migrationsDirectory = path.resolve(__dirname, '..', 'database', 'migrations');
const seedsDirectory = path.resolve(__dirname, '..', 'database', 'seeds');
const uploadsDirectory = path.resolve(__dirname, '..', '..', 'uploads');

async function removeFile(filename: string) {
    await fs.unlink(filename).catch(() => undefined);
}

async function run() {
    const { default: knex } = await import('../database/connection');
    const { default: app } = await import('../app');
    let uploadedImage = '';

    try {
        await knex.migrate.latest({ directory: migrationsDirectory });
        await knex.seed.run({ directory: seedsDirectory });

        const itemsResponse = await request(app)
            .get('/items')
            .expect(200);

        assert.equal(itemsResponse.body.length, 4);
        assert.match(itemsResponse.body[0].image_url, /^http:\/\/test\.local\/uploads\//);

        const emptyPointsResponse = await request(app)
            .get('/points')
            .expect(200);

        assert.deepEqual(emptyPointsResponse.body, []);

        await request(app)
            .get('/points/999999')
            .expect(404);

        await request(app)
            .post('/points')
            .field('descricao', 'Teste sem imagem')
            .field('city', 'Palmas')
            .field('uf', 'TO')
            .field('latitude', '-10.1')
            .field('longitude', '-48.2')
            .field('items', '1')
            .expect(400);

        const createResponse = await request(app)
            .post('/points')
            .field('hora', '12:00')
            .field('crime', 'Teste')
            .field('descricao', 'Denuncia de teste')
            .field('city', 'Palmas')
            .field('uf', 'TO')
            .field('latitude', '-10.1')
            .field('longitude', '-48.2')
            .field('items', '1')
            .attach('image', Buffer.from('test image'), 'test.png')
            .expect(200);

        assert.ok(createResponse.body.id);
        assert.equal(createResponse.body.city, 'Palmas');
        assert.equal(createResponse.body.uf, 'TO');
        assert.equal(createResponse.body.descricao, 'Denuncia de teste');
        uploadedImage = createResponse.body.image;

        const pointsResponse = await request(app)
            .get('/points')
            .query({ city: 'Palmas', uf: 'TO', items: '1' })
            .expect(200);

        assert.equal(pointsResponse.body.length, 1);
        assert.equal(pointsResponse.body[0].id, createResponse.body.id);
        assert.match(pointsResponse.body[0].image_url, /^http:\/\/test\.local\/uploads\//);

        const detailResponse = await request(app)
            .get(`/points/${createResponse.body.id}`)
            .expect(200);

        assert.equal(detailResponse.body.point.id, createResponse.body.id);
        assert.deepEqual(detailResponse.body.items, [{ title: 'Crimes' }]);
    } finally {
        await knex.destroy();
        await removeFile(process.env.DATABASE_URL as string);

        if (uploadedImage) {
            await removeFile(path.join(uploadsDirectory, uploadedImage));
        }
    }
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
