# Shelby File Manager

A demo file manager built on top of the [Shelby Protocol](https://shelby.xyz). Users connect their Aptos wallet, upload files to the Shelby decentralized storage network, and retrieve them later.

## Features

- Connect Petra wallet
- Upload files via drag-and-drop
- List previously uploaded files
- Download files
- File data stored through Shelby Protocol, metadata anchored on Aptos

## Tech Stack

**Frontend** — Next.js 14, React 18, Tailwind CSS, Aptos wallet adapter

**Backend** — Node.js, Express, Shelby Protocol SDK, Aptos SDK

## Project Structure

```
shelby-file-manager/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## Running Locally

The easiest way is with Docker:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

The frontend won't start until the backend passes its health check.

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

**Backend** (`backend/.env`):

```
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
APTOS_NETWORK=testnet
SHELBY_API_KEY=your_api_key_here
MAX_FILE_SIZE=52428800
```

**Frontend** (`frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_SHELBY_RPC_URL=https://api.testnet.shelby.xyz
NEXT_PUBLIC_APP_NAME=Shelby File Manager
```

Don't commit real API keys.

## How Upload Works

1. User connects their Petra wallet
2. User selects a file
3. Frontend sends the file to the backend
4. Backend uploads it to the Shelby network via the SDK
5. File metadata is recorded on Aptos testnet

## Notes

This is a demo project using Shelby testnet. Not intended for production use.