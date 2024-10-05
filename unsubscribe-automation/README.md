# Unsubscribe Automation Service

This service provides an automated solution for unsubscribing from email newsletters. It uses AI to analyze unsubscribe pages and performs automated actions to complete the unsubscribe process.

## Features

- AI-powered analysis of unsubscribe pages
- Automated web interactions using Playwright
- RESTful API endpoint for triggering unsubscribe actions
- Support for both OpenAI and Google AI models
- CORS support for easy integration with frontend applications

## Prerequisites

- Node.js (v14 or later)
- pnpm package manager
- A Google AI API key
- An OpenAI API key

## Installation

1. Navigate to the project directory:

   ```
   cd unsubscribe-automation
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:

   ```
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   CORS_ORIGIN=http://localhost:3000
   ```

   Replace the API keys with your actual keys, and adjust the CORS_ORIGIN if needed.

4. Install Playwright browsers:
   ```
   npx playwright install chromium
   ```

## Running the Service

1. Start the server:
   ```
   pnpm start
   ```
   The server will start on http://localhost:5000 by default.

## Usage

To use the unsubscribe service, send a POST request to the `/unsubscribe` endpoint:

```bash
curl -X POST http://localhost:5000/unsubscribe \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com/unsubscribe",
}'
```

- Replace `https://example.com/unsubscribe` with the actual unsubscribe URL.
- Set `useGoogle` to `true` to use Google AI, or `false` to use OpenAI.

## API Endpoints

- `GET /`: Health check endpoint
- `POST /unsubscribe`: Trigger the unsubscribe process

## Development

- To run the service in development mode with hot reloading:

  ```
  pnpm run dev
  ```

- To build the TypeScript files:
  ```
  pnpm run build
  ```

## Troubleshooting

- If you encounter any issues with Playwright, ensure that you have the necessary system dependencies installed. Refer to the [Playwright installation guide](https://playwright.dev/docs/intro#installation) for more information.
- Check the console output for any error messages or logs that might indicate the cause of any issues.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
