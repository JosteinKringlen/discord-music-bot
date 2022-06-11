# Discord Music Bot

## Creating a Discord bot

### Creating the app/bot

Go to [https://discord.com/developers](https://discord.com/developers) and login. Click `New Application`, give the app a name and click `Create`.

Click `Bot` on the left hand pane, then click `Add Bot`, then `Yes, do it!`

### Adding the bot to your server

On [https://discord.com/developers](https://discord.com/developers), select your app, then click `OAuth2 -> URL Generator` on the left. Check all the following `Scopes` and `Bot Permissions` listed below, then copy the generated URL. Paste that URL into a new browser tab and select the server you want to add the bot to.

Scopes

- [X] `bot`
  
Bot Permissions

- Text Permissions
  - [X] `Send Messages`
  - [X] `Embed Links`
  - [X] `Add Reactions`
- Voice Permissions
  - [X] `Connect`
  - [X] `Speak`
  - [X] `Use Voice Activity`

### Getting a token for the app

On [https://discord.com/developers](https://discord.com/developers), select your app, and click `Bot` on the left. Click the `Reset Token` button under the bot's username, and then click `Yes, do it!`. Enter your 2FA code if prompted, and then copy the token.

## Running the bot

### **Running from cloned repo**

Clone the repo and install dependencies:

```bash
git clone https://github.com/JosteinKringlen/discord-music-bot.git
cd discord-music-bot
npm install
```

Create a `.env` file in the root of the repo and copy the content from [`.env.example`](.env.example) into it. Get your Discord token by following the steps in the [`Getting a token for the app`](#getting-a-token-for-the-app) section, and add it to the `.env` file.

When the token has been added to `.env`, you can start the app by running

```bash
npm run build && npm start
```

#### Dev mode

The bot can also be run in dev/watch mode by running

```bash
npm run dev
```

## Commands

| Command   | Alias | Explanation                                                                                                                                                                                              | Roles         | Example                                                                             |
| --------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------- |
| `!play`   | `!p`  | Joins voice channel (if not already joined), searches YouTube and plays the first result or plays the given YouTube link. Using the command without supplying a string will play/pause the current song. | Everyone      | `!play crab rave`<br>`!play https://www.youtube.com/watch?v=LDU_Txk06tM`<br>`!play` |
| `!pause`  |       | Pauses the currently playing song                                                                                                                                                                        | Everyone      | `!pause`                                                                            |
| `!fs`     |       | Force skips to the next song in the queue. Will stop playing if the current song is the last song in the queue.                                                                                          | `ADMIN`, `DJ` | `!fs`                                                                               |
| `!remove` | `!rm` | Removes a song at position `X` from the queue                                                                                                                                                            | Everyone      | `!remove 4`                                                                         |
| `!queue`  | `!q`  | Lists the queue                                                                                                                                                                                          | Everyone      | `!queue`                                                                            |
| `!np`     |       | Lists the currently playing song                                                                                                                                                                         | Everyone      | `!np`                                                                               |
