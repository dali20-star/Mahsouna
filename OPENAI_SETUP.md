# OpenAI API Setup Guide

This guide explains how to configure the OpenAI API key for the chatbot feature.

## 1. Get Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again)

## 2. Configure the Environment Variable

Choose ONE of the following methods:

### Option A: Using .env File (Recommended for Development)

1. In the `backend/` folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `backend/.env` and replace:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
   
   With your actual key:
   ```
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. Save the file. The Django app will automatically read it on startup.

**Important:** Never commit `.env` to version control. It's already in `.gitignore`.

### Option B: Using Environment Variables (Windows)

1. Set the environment variable permanently:
   ```powershell
   $env:OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

2. Or set it for the current session only:
   ```powershell
   $env:OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   python manage.py runserver
   ```

### Option C: Using System Environment (Windows)

1. Open "Environment Variables":
   - Press `Win + R`, type `envEdit`, press Enter
   - Or: Settings → System → About → Advanced system settings

2. Click "Environment Variables"

3. Under "User variables", click "New"
   - Variable name: `OPENAI_API_KEY`
   - Variable value: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. Click OK and restart your terminal/IDE

## 3. Verify the Setup

Run the Django development server:
```bash
cd backend
python manage.py runserver
```

Then test the chatbot:
1. Open http://localhost:3005/chat
2. Create a new chat session
3. Send a message

## Troubleshooting

### Error: "OpenAI API key not configured"

- Check that the `.env` file exists in the `backend/` folder
- Verify the line: `OPENAI_API_KEY=sk-...` (no spaces around `=`)
- Restart the Django server after setting the environment variable
- If using Windows, make sure to restart the terminal after setting system environment variables

### Error: "OpenAI SDK is not installed"

Install the required package:
```bash
cd backend
pip install -r requirements.txt
```

Or manually:
```bash
pip install openai==1.3.0
```

### Error with API key (4xx/5xx response from OpenAI)

- Verify your API key is correct (copy-paste from OpenAI dashboard)
- Check that your OpenAI account has active billing
- Ensure you haven't exceeded your API quota

## How It Works

1. **Environment Variable Reading**: Django uses the `python-decouple` library to read environment variables from `.env` files or system environment
2. **Settings Configuration**: `backend/config/settings.py` loads the key: `OPENAI_API_KEY = config('OPENAI_API_KEY', default=None)`
3. **View Access**: Chat views access the key from Django settings: `settings.OPENAI_API_KEY`
4. **Security**: The API key is never exposed to the frontend (React) - it stays in the backend

## Security Notes

- ✅ API key is backend-only (never sent to React)
- ✅ `.env` file is in `.gitignore` (won't be committed)
- ✅ API key is read-only from environment (not hardcoded)
- ✅ Clear error messages if key is missing

For production, use a secrets manager like AWS Secrets Manager, Azure Key Vault, or similar.
