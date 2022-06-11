import { createAudioResource as discordJsCreateAudioResource } from '@discordjs/voice';
import { stream } from 'play-dl';

const VOLUME_PERCENTAGE = 50;

export default async function createAudioResource(url: string) {
    const source = await stream(url, {
        discordPlayerCompatibility: true,
        quality: 2,
    });
    const resource = discordJsCreateAudioResource(source.stream, {
        inputType: source.type,
        inlineVolume: true,
    });

    resource.volume?.setVolume(
        (VOLUME_PERCENTAGE / 100) ** (0.5 / Math.log10(2)),
    );

    return resource;
}
