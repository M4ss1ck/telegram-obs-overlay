# Telegram OBS Overlay

A real-time Telegram to OBS overlay generator that displays messages from a specific Telegram chat or channel in your OBS stream.

## Features

- Real-time display of Telegram messages in OBS via Socket.IO
- User-configurable Chat ID via the web interface
- Customizable themes (Dark, Light, Transparent, Purple, Green, Gaming) and custom colors
- Adjustable message display time and maximum message count
- Option to keep messages on screen permanently
- Support for text messages, images, stickers, and animations (GIFs)
- Easy setup with a browser source in OBS
- Built-in `/chatid` command for the bot to easily get the required Chat ID
- Docker and Coolify support

## Setup

### Prerequisites

- Node.js (v14 or higher recommended)
- A Telegram bot token (get one from [@BotFather](https://t.me/botfather))
- Your Telegram bot added to the chat/channel you want to display

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/M4ss1ck/telegram-obs-overlay.git
   cd telegram-obs-overlay
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the example:

   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file and add your Telegram bot token.

   ```dotenv
   # .env
   BOT_TOKEN=your_bot_token_here
   PORT=3000 # Optional: Change the port if needed
   ```

## Usage

1. Start the server:

   ```bash
   npm start
   ```

   The server will start, and the bot will come online. You'll see output like:

   ```
   Server running on port 3000
   Configuration page: http://localhost:3000/
   Attempting to start Telegram bot...
   Bot initialized: @your_bot_username
   ```

2. Open the configuration page:

   Open your browser and go to `http://localhost:3000` (or your configured port).

3. Get Your Chat ID:

   - The configuration page will display your bot's username (e.g., `@your_bot_username`).
   - Add this bot to the Telegram group or channel you want to display messages from. Make sure it has permissions to read messages (adding it as an admin is easiest).
   - In that Telegram chat (group/channel), type the command: `/chatid`
   - The bot will reply with the unique Chat ID for that chat (it's usually a negative number for groups/channels).

4. Configure the overlay:

   - On the configuration page (`http://localhost:3000`), go to the "Basic" settings tab.
   - Enter the Chat ID you got from the bot into the "Chat ID" field.
   - Customize other settings like theme, colors, max messages, and display time as needed.
   - Click "Apply Settings".

5. Add to OBS:

   - Copy the generated "Overlay URL" from the configuration page.
   - In OBS, add a new "Browser" source.
   - Paste the copied URL into the "URL" field.
   - Set the desired Width and Height for the overlay (e.g., Width: 400, Height: 600).
   - **Important:** Ensure the OBS Browser Source dimensions match your expectations for how the chat should look.
   - Check "Refresh browser when scene becomes active" for reliability.
   - Click "OK".

Messages sent in the configured Telegram chat should now appear in your OBS source!

## Docker Deployment

You can run this application using Docker. The setup automatically detects the `BOT_TOKEN` and `PORT` from your `.env` file.

### Production Mode

To run the application in production mode:

```bash
# Start the container
npm run docker:start

# Or with docker compose directly
docker compose up -d
```

### Development Mode with File Watching

To run in development mode with file watching (changes to files will automatically sync with the container):

```bash
# Start in development mode with watch
npm run docker:dev

# Or with docker compose directly
docker compose up --watch
```

### Docker Commands

The following npm scripts are available for Docker:

- `npm run docker:build` - Build the Docker image
- `npm run docker:start` - Start the container in production mode
- `npm run docker:stop` - Stop the container
- `npm run docker:dev` - Start with file watching (for development)
- `npm run docker:logs` - View the container logs

## Coolify Deployment

This project includes ready-to-use configuration for deployment with [Coolify](https://coolify.io/).

### Steps to Deploy on Coolify:

1. Make sure you have a Coolify instance running.

2. In the Coolify dashboard, create a new service:

   - Choose "Application"
   - Select "Docker" as the deployment method
   - Provide your Git repository URL

3. Configure the deployment:

   - Set the build method to "Dockerfile"
   - Add the following **required** environment variable:
     - `BOT_TOKEN`: Your Telegram bot token
   - Optionally add:
     - `PORT`: Port for the application (default: 3000)

4. Set up the network:

   - Make sure to expose port 3000 (or your custom port)
   - Configure the domain if you want to access the application via a domain name

5. Deploy the application.

6. Once deployed, access the configuration page at `http://your-coolify-app-url:3000` (or your domain) to set the Chat ID and get the Overlay URL. The overlay itself will be available at the `/overlay` path on the same domain/IP.

## Customization

The web interface (`http://localhost:3000`) allows you to customize:

- The specific Telegram Chat ID to monitor
- Maximum number of messages displayed at once
- How long each message stays on screen (or keep permanently)
- The theme (Dark, Light, Transparent, Purple, Green, Gaming)
- Custom message bubble color, text color, and name color

## Bot Permissions

For the bot to receive messages:

1. Add the bot to the target group or channel.
2. **Crucially, ensure the bot has permission to read messages.** The simplest way is often to make it an administrator. If not an admin, group privacy settings might prevent it from seeing all messages.
3. For private chats with the bot, simply start a conversation.

## Troubleshooting

- **Messages not appearing?**
  - Double-check the Chat ID entered in the web UI is correct (use `/chatid` in the target chat).
  - Ensure the bot is in the chat _and_ has permission to read messages (Admin privileges recommended).
  - Verify the Overlay URL copied into OBS is correct and includes the `chatId` parameter.
  - Check the server console output for errors during message processing.
  - Check the OBS Browser Source console (Right-click source -> Interact -> Right-click inside -> Inspect -> Console) for connection errors or other issues.
- **Bot not responding to `/chatid`?**
  - Ensure the server is running (`npm start`).
  - Check the server console for startup errors (e.g., invalid `BOT_TOKEN`).
  - Make sure you are typing the command _exactly_ as `/chatid` in the correct chat.
- **Web UI not loading bot username?** Check the server console for errors fetching bot info (likely an invalid `BOT_TOKEN` in `.env`).
- **Images/Stickers not showing?** Ensure the server can reach `https://api.telegram.org`. Firewalls or network issues might block this.
- **Docker/Coolify issues?** Check container logs (`npm run docker:logs` or via Coolify dashboard) for errors related to `BOT_TOKEN`, port conflicts, or network connectivity.
- **Watch mode not working?** Ensure you don't have conflicting volume mounts in your `docker-compose.yml` or Coolify configuration.

## License

MIT
