# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PHP CodeSniffer Playground is a web application that allows users to check PHP code against coding standards in real-time using WebAssembly. The project compiles multiple PHP versions (5.6-8.4) to WebAssembly and provides an interactive browser-based PHP code quality checking environment using PHP_CodeSniffer with PSR-12 and PEAR coding standards.

## Development Commands

### Build Commands
- `npm run dev` - Start development server with hot reload (runs on http://127.0.0.1:18888)
- `npm run build` - Build JavaScript for production
- `npm run preview` - Build and preview production version on port 8888

### WebAssembly Build Commands
- `make build` - Build all PHP WebAssembly versions with PHP_CodeSniffer (heavy operation, runs in parallel)
- `make build-wasm PHP_VERSION=8.2` - Build specific PHP version to WebAssembly with CodeSniffer
- Individual version builds: `make build-5.6`, `make build-7.0`, etc.

### PHP_CodeSniffer Integration
The WebAssembly build process now includes PHP_CodeSniffer:
- Composer installs `squizlabs/php_codesniffer` during Docker build
- CodeSniffer files are preloaded into WebAssembly filesystem at `/phpcs/`
- Runtime includes a helper script at `/phpcs/phpcs-runner.php` for easy integration
- Supports PSR-12 and PEAR coding standards

### Testing Commands
- `npm run test` - Run unit tests with Vitest
- `npm run test:ci` - Run tests once (CI mode)
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:report` - Show Playwright test report

### Code Quality Commands
- `npm run lint:js` - Run ESLint on JavaScript/TypeScript files
- `npm run lint:js:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `make lint` - Run both ESLint and TypeScript compilation
- `make style-fix` - Fix both linting and formatting issues

### Makefile Shortcuts
- `make test` - Run unit tests
- `make test-ci` - Run tests in CI mode

## Architecture

### Core Components

**Main App Structure:**
- `src/app.tsx` - Main application component handling URL state, version selection, and layout
- `src/editor.tsx` - Editor component using Monaco Editor and Sandpack for PHP code editing
- `src/php.ts` - React hooks and utilities for PHP execution
- `src/php-wasm/` - PHP WebAssembly integration layer

**PHP WebAssembly Integration:**
- `src/php-wasm/php.ts` - Core PHP runtime wrapper with comprehensive API for running PHP code
- `src/php-wasm/php-browser.ts` & `src/php-wasm/php-server.ts` - Environment-specific PHP implementations
- `src/wasm-assets/` - Generated JavaScript loaders for each PHP version
- `assets/` - WebAssembly binaries for each PHP version

**UI Components:**
- `src/select.tsx` - PHP version selector
- `src/format.tsx` - Output format selector (HTML/console)
- `src/theme.tsx` - Chakra UI theme configuration

### Key Features

**Multi-Version PHP Support:**
The application supports PHP versions 5.6 through 8.4, with WebAssembly binaries and JavaScript loaders for each version stored in `assets/` and `src/wasm-assets/` respectively.

**Code Checking Flow:**
1. User enters PHP code in Monaco Editor
2. Code is processed through `useCodeSniffer` hook in `src/php.ts`
3. PHP WebAssembly runtime is initialized for selected version
4. User's PHP code is written to `/tmp/check.php` in WebAssembly filesystem
5. CodeSniffer runner script (`/phpcs/phpcs-runner.php`) is executed with selected standard
6. PHP_CodeSniffer analyzes the code against PSR-12 or PEAR standards
7. Results are displayed in a formatted output panel showing violations or success message

**URL State Management:**
The app uses URL parameters with LZ-string compression to store and share code, version, and coding standard settings.

### Build Pipeline

**WebAssembly Build:**
The PHP-to-WebAssembly build process uses Docker and is based on WordPress Playground's build pipeline. The `Makefile` orchestrates building multiple PHP versions in parallel, with customizable compilation options.

**Frontend Build:**
Uses Vite with React for the frontend build process, with TypeScript support and Chakra UI for styling.

### Testing Setup

**Unit Tests:**
- Vitest with environment-specific configuration
- Tests in `src/__test__/` with both Node.js and jsdom environments
- Test files: `*.spec.ts` (jsdom), `*.test.ts` (node)

**E2E Tests:**
- Playwright tests in `e2e/` directory
- Tests the full application workflow including PHP code execution