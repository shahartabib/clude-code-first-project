# Vite SPA Boilerplate

A modern, lightweight boilerplate for building Single Page Applications (SPAs) using Vite.

## Features

- **Vite** - Next generation frontend tooling with lightning-fast HMR (Hot Module Replacement)
- **Modern JavaScript** - ES2020+ support out of the box
- **Development Ready** - Pre-configured development and production builds
- **Minimal Setup** - Get started quickly with minimal configuration

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
.
├── src/
│   ├── main.js          # Application entry point
│   ├── style.css        # Global styles
│   └── assets/          # Static assets
├── public/              # Public static files
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── package.json         # Project dependencies
└── README.md            # This file
```

## Configuration

Edit `vite.config.js` to customize Vite configuration based on your needs.

## Browser Support

Vite targets browsers with native ES modules support. The build output is compatible with all browsers that support ES2015 (ES6).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
