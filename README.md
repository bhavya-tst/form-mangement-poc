# Asset Proxy Service

This Node.js/Express service acts as a proxy for serving JavaScript and CSS assets. It replaces a direct CDN implementation to allow for future conditional logic, enhanced logging, and control over asset delivery.

## Features

*   **Asset Proxying**: Downloads assets from a configured source (S3) and serves them.
*   **Performance Caching**:
    *   **In-Memory**: Assets are cached in RAM for instant serving.
    *   **Disk**: Assets are persisted to disk (`public/assets_cache`) to survive restarts.
*   **Enhanced Logging**: Logs the full `Referer` URL to track which pages are requesting assets.
*   **CORS Support**: Configured to serve assets to different domains/ports.
*   **Structured Logging**: Uses `winston` for robust, rotating log files (`logs/`).

## Prerequisites

*   Node.js (v20+ recommended)
*   npm

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

The application is configured via environment variables. A `.env` file should be created in the root directory.

**Example `.env`**:
```env
PORT=4010
NODE_ENV=development
```

## Running the Application

*   **Development Mode**:
    ```bash
    npm run dev
    ```
    (Requires Node.js v18.11+ for `--watch` flag)

*   **Production Start**:
    ```bash
    npm start
    ```

## API Endpoints

### JavaScript Asset
*   **URL**: `/assets/script.js` (or `/assets/appy-tier3.js`)
*   **Method**: `GET`
*   **Response**: Returns the JavaScript file content.

### CSS Asset
*   **URL**: `/assets/style.css` (or `/assets/appy-tier3.css`)
*   **Method**: `GET`
*   **Response**: Returns the CSS file content.

## Project Structure

*   `bin/www`: server entry point.
*   `app.js`: Express application setup (middleware, helmet, cors).
*   `modules/assets`: Core logic for asset handling.
    *   `service.js`: Caching and retrieval logic.
    *   `controller.js`: Request handling and logging.
*   `utils/logger.js`: ES6 logger configuration.
