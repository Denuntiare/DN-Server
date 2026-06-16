import { Request } from 'express';

function trimTrailingSlashes(url: string) {
    return url.replace(/\/+$/, '');
}

export function getBaseUrl(request: Request) {
    const configuredUrl = process.env.API_URL || process.env.APP_URL;

    if (configuredUrl) {
        return trimTrailingSlashes(configuredUrl);
    }

    const host = request.get('host');

    if (host) {
        return `${request.protocol}://${host}`;
    }

    return `http://localhost:${process.env.PORT || 3333}`;
}

export function getUploadUrl(request: Request, filename: string) {
    return `${getBaseUrl(request)}/uploads/${filename}`;
}
