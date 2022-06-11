import 'dotenv/config';

import { bold, hyperlink, italic } from '@discordjs/builders';
import { createAudioPlayer } from '@discordjs/voice';
import { Client, Intents, MessageButton, MessageEmbed } from 'discord.js';
// @ts-ignore
import paginationEmbed from 'discordjs-button-pagination';
import invariant from 'tiny-invariant';

import createQueueEmbed from './utils/create-queue-embed';
import getCommandGroup from './utils/get-command-group';
import logger from './utils/logger';
import PlayerInstance from './utils/player-instance';
import searchYouTube from './utils/search-youtube';

const { DISCORD_TOKEN, PREFIX = '!' } = process.env;

const ELEVATED_ROLES = ['ADMIN', 'DJ'];

const audioPlayer = createAudioPlayer();

invariant(DISCORD_TOKEN, 'DISCORD_TOKEN environment variable must be set');

const playerInstance = new PlayerInstance(audioPlayer);

// Create a new client instance
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

client.once('ready', () => {
    logger.info('Discord bot ready!');
});

client.on('messageCreate', async (message) => {
    const { content, channel } = message;
    const strArray = content.split(' ');
    const commandGroup = getCommandGroup(PREFIX, strArray[0]);

    switch (true) {
        /* ------------ PLAY ------------ */
        case commandGroup === 'PLAY': {
            const voiceChannel = message.member?.voice?.channel;
            if (!voiceChannel) {
                channel.send(
                    'Gotta be in a voice channel in order to play music!',
                );
                break;
            }
            await playerInstance.joinChannel(voiceChannel);

            const { playState } = playerInstance;

            if (strArray.length === 1) {
                const hasPlayable = audioPlayer.checkPlayable();

                if (hasPlayable) {
                    if (playState === 'PLAYING') {
                        playerInstance.pause();
                        channel.send(italic('Pausing playback...'));
                        break;
                    }
                    if (playState === 'PAUSED') {
                        playerInstance.play();
                        channel.send(italic('Resuming playback...'));
                        break;
                    }
                }
                channel.send('Nothing to play/pause');
                break;
            }

            let queryString = '';

            if (strArray.length === 2) {
                try {
                    const url = new URL(strArray[1]);
                    if (
                        !url.hostname.endsWith('youtube.com') ||
                        url.pathname !== '/watch' ||
                        !url.search.startsWith('?v=')
                    ) {
                        channel.send('I need a valid YouTube URL yo');
                        break;
                    }
                    queryString = url.toString();
                } catch {
                    //
                }
            }
            queryString = strArray.slice(1).join(' ');

            try {
                const song = await searchYouTube(queryString);
                if (!song) {
                    channel.send(`Found no results for ${italic(queryString)}`);
                    break;
                }

                playerInstance.addToQueue(song, message.author.username);
                if (playerInstance.queue.length <= 1 && playState === 'IDLE') {
                    await playerInstance.playNext();

                    channel.send(
                        `Playing ${bold(song.title)} (requested by ${
                            message.author.username
                        })`,
                    );

                    break;
                }

                channel.send(
                    `Added ${bold(song?.title)} to queue at position ${
                        playerInstance.queue.length
                    }`,
                );
            } catch (error) {
                console.error(error);
            }
            break;
        }

        /* ------------ PAUSE ------------ */
        case content === `${PREFIX}pause`: {
            playerInstance.pause();
            break;
        }

        /* ------------ FORCE SKIP ------------ */
        case content === `${PREFIX}fs`: {
            const member = await message.member?.fetch();
            const isPermittedToFs = member?.roles.cache.some((role) =>
                ELEVATED_ROLES.includes(role.name),
            );

            if (isPermittedToFs) {
                await playerInstance.playNext();
            }
            break;
        }

        /* ------------ QUEUE ------------ */
        case commandGroup === 'QUEUE': {
            if (playerInstance.queue.length === 0) {
                channel.send(italic('Queue is empty'));
                break;
            }

            const { type, embeds } = createQueueEmbed(playerInstance.queue);

            const nextButton = new MessageButton()
                .setCustomId('next-btn')
                .setLabel('Next page')
                .setStyle('SECONDARY');
            const prevButton = new MessageButton()
                .setCustomId('prev-btn')
                .setLabel('Previous page')
                .setStyle('SECONDARY');

            if (type === 'MULTI_PAGE') {
                paginationEmbed(message, embeds, [prevButton, nextButton]);
            } else {
                channel.send({ embeds });
            }
            break;
        }

        /* ------------ REMOVE ------------ */
        case commandGroup === 'REMOVE': {
            const position = parseInt(strArray[1], 10);
            if (Number.isNaN(position)) {
                channel.send(`Use an integer plox`);
                break;
            }

            if (position > playerInstance.queue.length || position <= 0) {
                channel.send(`No song to remove for position \`${position}\``);
                break;
            }

            const removed = playerInstance.removeFromQueue(position);
            channel.send(`Removed ${bold(removed[0].title)} from queue`);
            break;
        }

        /* ------------ NOW PLAYING ------------ */
        case content === `${PREFIX}np`: {
            const { nowPlaying } = playerInstance;

            if (!nowPlaying) {
                channel.send(italic('Nothing playing'));
                break;
            }

            const url = new URL(nowPlaying.url);

            const imgUrl = `https://img.youtube.com/vi/${url.searchParams.get(
                'v',
            )}/0.jpg`;

            const embed = new MessageEmbed()
                .setColor('#663399')
                .setTitle('🎶 Now Playing 🎶')
                .setDescription(
                    bold(hyperlink(nowPlaying.title, nowPlaying.url)),
                )
                .addField('\u200B', `Requested by ${nowPlaying.requestedBy}`)
                .setImage(imgUrl)
                .setTimestamp();

            channel.send({ embeds: [embed] });
            break;
        }

        default:
            break;
    }
});
// Login to Discord with your client's token
client.login(DISCORD_TOKEN);
