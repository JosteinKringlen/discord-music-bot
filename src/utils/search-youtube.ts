import type { Video } from 'ytsr';
import ytsr from 'ytsr';

import logger from './logger';

export default async function searchYouTube(q: string): Promise<Video | null> {
    try {
        const res = await ytsr(q, { limit: 5 });

        const filtered = res.items.filter((r) => r.type === 'video').at(0);

        if (!filtered) {
            return null;
        }

        return filtered as Video;
    } catch (err) {
        logger.error(`An error occurred while searching YouTube for ${q}`, err);
    }
    return null;
}
