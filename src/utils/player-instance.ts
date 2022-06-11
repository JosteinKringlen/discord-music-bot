/* eslint-disable no-underscore-dangle */
import type { AudioPlayer, VoiceConnection } from '@discordjs/voice';
import {
    AudioPlayerStatus,
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';
import invariant from 'tiny-invariant';
import type { Video } from 'ytsr';

import createAudioResource from './create-audio-resource';

export type Song = Video & { requestedBy: string };
export type Queue = Array<Song>;

const ONE_MINUTE = 60_000;
const { IDLE_DISCONNECT_TIMEOUT = ONE_MINUTE } = process.env;

invariant(
    Number.isInteger(Number(IDLE_DISCONNECT_TIMEOUT)),
    'IDLE_DISCONNECT_TIMEOUT must be an integer',
);

type PlayState = 'BUFFERING' | 'PLAYING' | 'PAUSED' | 'IDLE';

function convertPlayState(status: AudioPlayerStatus): PlayState {
    switch (status) {
        case AudioPlayerStatus.Buffering:
            return 'BUFFERING';
        case AudioPlayerStatus.Playing:
            return 'PLAYING';
        case AudioPlayerStatus.Paused:
            return 'PAUSED';
        default:
            return 'IDLE';
    }
}

export default class PlayerInstance {
    audioPlayer: AudioPlayer;

    private _connection: VoiceConnection;

    private _queue: Queue;

    private timeout: NodeJS.Timeout;

    private _nowPlaying: Song | null;

    private _playState: PlayState = 'IDLE';

    constructor(audioPlayer: AudioPlayer) {
        this.audioPlayer = audioPlayer;
        this._queue = [];
        this._nowPlaying = null;

        this.audioPlayer.addListener(
            // @ts-ignore
            'stateChange',
            async (oldState, newState) => {
                this._playState = convertPlayState(newState.status);
                if (newState.status === AudioPlayerStatus.Idle) {
                    this._nowPlaying = null;
                    this.timeout = setTimeout(() => {
                        this.disconnect();
                    }, IDLE_DISCONNECT_TIMEOUT as number);
                }
                if (
                    oldState.status === AudioPlayerStatus.Playing &&
                    newState.status === AudioPlayerStatus.Idle
                ) {
                    await this.playNext();
                }
            },
        );
    }

    async joinChannel(channel: VoiceBasedChannel) {
        this._connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        try {
            await entersState(
                this._connection,
                VoiceConnectionStatus.Ready,
                30_000,
            );
            return this._connection;
        } catch (error) {
            this._connection.destroy();
            throw error;
        }
    }

    async playNext() {
        this.audioPlayer.pause();
        const nextUp = this._queue.shift();
        if (!nextUp) {
            this.audioPlayer.stop();
            this._playState = 'IDLE';
            return;
        }

        const resource = await createAudioResource(nextUp.url);
        this._nowPlaying = nextUp;
        this.audioPlayer.play(resource);
        this._connection.subscribe(this.audioPlayer);
        clearTimeout(this.timeout);
    }

    play() {
        this.audioPlayer.unpause();
    }

    pause() {
        this.audioPlayer.pause();
    }

    addToQueue(video: Video, requestedBy: string) {
        this.queue.push({ ...video, requestedBy });
    }

    disconnect() {
        this.audioPlayer.stop(true);
        this._connection.destroy();
    }

    removeFromQueue(position: number) {
        return this._queue.splice(position - 1, 1);
    }

    get nowPlaying(): Song | null {
        return this._nowPlaying;
    }

    get queue() {
        return this._queue;
    }

    get playState(): PlayState {
        return this._playState;
    }

    set playState(state: PlayState) {
        this._playState = state;
    }
}
