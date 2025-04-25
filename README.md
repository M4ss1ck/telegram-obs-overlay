# Telegram OBS Overlay

A real-time Telegram to OBS overlay generator that displays messages from a specific Telegram chat or channel in your OBS stream.

## Features

- Real-time display of Telegram messages in OBS
- Customizable themes (Dark, Light, Transparent)
- Adjustable message display time
- Configurable maximum number of messages
- Support for text messages, images, stickers, and animations
- Easy setup with a browser source in OBS

## Setup

### Prerequisites

- Node.js (v12 or higher)
- A Telegram bot token (get one from [@BotFather](https://t.me/botfather))
- The chat ID of the Telegram chat you want to display

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/telegram-obs-overlay.git
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

4. Edit the `.env` file and add your Telegram bot token and chat ID:
   ```
   BOT_TOKEN=your_bot_token_here
   CHAT_ID=your_chat_id_here
   PORT=3000
   ```

### Getting Your Chat ID

1. Add your bot to the chat you want to display
2. Send a message in the chat
3. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for the `"chat":{"id":123456789}` field to get your chat ID

## Usage

1. Start the server:

   ```bash
   npm start
   ```

2. Open your browser and go to `http://localhost:3000` (or your configured port)

3. Add the overlay URL as a Browser Source in OBS:

   - In OBS, add a new "Browser" source
   - Set the URL to `http://localhost:3000/overlay`
   - Set the width and height as needed
   - Check "Refresh browser when scene becomes active"

4. Customize the overlay appearance in the web interface and click "Apply Settings"

## Docker Deployment

You can also run this application using Docker:

```bash
docker-compose up -d
```

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
   - Add the following environment variables:
     - `BOT_TOKEN`: Your Telegram bot token
     - `CHAT_ID`: Your Telegram chat ID
     - `PORT`: Port for the application (default: 3000)

4. Set up the network:

   - Make sure to expose port 3000 (or your custom port)
   - Configure the domain if you want to access the application via a domain name

5. Deploy the application and wait for the build to complete.

6. Once deployed, you can access the overlay at `https://your-domain/overlay` or `http://your-server-ip:3000/overlay`.

## Customization

The web interface allows you to customize:

- Maximum number of messages displayed at once
- How long each message stays on screen
- The theme (Dark, Light, or Transparent)

## Bot Permissions

For the bot to receive messages from a group or channel:

1. For groups: Add the bot as an administrator or regular member
2. For channels: Add the bot as an administrator
3. For private chats: Start a conversation with the bot

## Troubleshooting

- **Messages not appearing?** Make sure your bot is in the chat and has permission to read messages
- **Bot not receiving messages?** For privacy reasons, Telegram bots in groups only receive messages that explicitly mention them, or commands they can handle, unless the bot is an admin
- **Images not showing?** Make sure your server can reach the Telegram API to download the files
- **Docker or Coolify issues?** Check the logs for any errors related to environment variables or network connectivity

## License

MIT
