import { MessageEmbed } from 'discord.js';

import type { Queue } from './player-instance';

const CHUNK_SIZE = 5;

export default function createQueueEmbed(queue: Queue): {
    type: 'SINGLE_PAGE' | 'MULTI_PAGE';
    embeds: Array<MessageEmbed>;
} {
    const chunks = [];
    for (let i = 0; i < queue.length; i += CHUNK_SIZE) {
        const chunk = queue.slice(i, i + CHUNK_SIZE);
        chunks.push(chunk);
    }

    const embeds = chunks.map((c, chunkIndex) =>
        new MessageEmbed()
            .setColor('#663399')
            .setTitle(`🎶 Queue 🎶`)
            .setTimestamp()
            .addFields(
                c.map((s, relativeSongIndex) => ({
                    name: `${(relativeSongIndex + 1 + chunkIndex * CHUNK_SIZE)
                        .toString()
                        .padStart(2, '0')}. ${s.title}`,
                    value: `[YouTube Link](${s.url}) | Requested by ${s.requestedBy}`,
                })),
            ),
    );

    return {
        type: chunks.length > 1 ? 'MULTI_PAGE' : 'SINGLE_PAGE',
        embeds,
    };
}
