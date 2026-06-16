import { Request, Response} from 'express';
import knex from '../database/connection';
import { getUploadUrl } from '../utils/url';

function parseRequiredString(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function parseItems(value: unknown) {
    const rawItems = Array.isArray(value)
        ? value
        : String(value || '').split(',');

    return rawItems
        .map(item => Number(String(item).trim()))
        .filter(item => !isNaN(item) && isFinite(item) && item > 0 && item % 1 === 0);
}

function parseCoordinate(value: unknown) {
    const coordinate = Number(value);

    return !isNaN(coordinate) && isFinite(coordinate)
        ? coordinate
        : null;
}

class PointsController {

    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;
        const selectedCity = parseRequiredString(city);
        const selectedUf = parseRequiredString(uf);
        const parsedItems = parseItems(items);

        if (!selectedCity || !selectedUf || parsedItems.length === 0) {
            return response.json([]);
        }

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', selectedCity)
            .where('uf', selectedUf)
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: getUploadUrl(request, point.image),
            };
        });

        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const point = await knex('points').where('id', id).first();
        
        if(!point) {
            return response.status(404).json({ message: 'Point not found.' });
        }

        const serializedPoint = {
                ...point,
                image_url: getUploadUrl(request, point.image),
        };

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return response.json({point: serializedPoint, items});
    }

    async create(request: Request, response: Response) {
        const {
            hora,
            crime,
            descricao,
            latitude,
            longitude,
            city,
            uf,
            items,
        } = request.body;

        const selectedCity = parseRequiredString(city);
        const selectedUf = parseRequiredString(uf);
        const selectedDescricao = parseRequiredString(descricao);
        const parsedLatitude = parseCoordinate(latitude);
        const parsedLongitude = parseCoordinate(longitude);
        const parsedItems = parseItems(items);

        if (!request.file) {
            return response.status(400).json({ message: 'Image is required.' });
        }

        if (!selectedDescricao || !selectedCity || !selectedUf) {
            return response.status(400).json({ message: 'Description, city and UF are required.' });
        }

        if (parsedLatitude === null || parsedLongitude === null) {
            return response.status(400).json({ message: 'Valid latitude and longitude are required.' });
        }

        if (parsedItems.length === 0) {
            return response.status(400).json({ message: 'At least one item is required.' });
        }
    
        const trx = await knex.transaction();

        try {
            const point = {
                image: request.file.filename,

                hora,
                crime,
                descricao: selectedDescricao,
                latitude: parsedLatitude,
                longitude: parsedLongitude,
                city: selectedCity,
                uf: selectedUf,
            };

            const insertedIds = await trx('points').insert(point);

            const point_id = insertedIds[0];

            const pointItems = parsedItems.map((item_id: number) => {
                return {
                    item_id,
                    point_id,
                };
            });

            await trx('point_items').insert(pointItems);

            await trx.commit();

            return response.json({
                id: point_id,
                ...point,
            });
        } catch (error) {
            await trx.rollback();

            return response.status(500).json({ message: 'Failed to create point.' });
        }
    }
}

export default PointsController;
