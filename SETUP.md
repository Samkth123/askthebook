# Setup Instructions

## Installing Node.js

You need to install Node.js first to use `npm`. Here are the easiest ways:

### Option 1: Download from Official Website (Recommended)

1. **Visit the Node.js website:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version for macOS
   - Choose the `.pkg` installer for your Mac (Apple Silicon or Intel)

2. **Install Node.js:**
   - Open the downloaded `.pkg` file
   - Follow the installation wizard
   - This will install both Node.js and npm

3. **Verify installation:**
   Open Terminal and run:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers for both.

### Option 2: Using Homebrew (if permissions are fixed)

If you have Homebrew installed and want to use it:

1. **Fix Homebrew permissions** (if needed):
   ```bash
   sudo chown -R $(whoami) /opt/homebrew/Cellar
   ```

2. **Install Node.js:**
   ```bash
   brew install node
   ```

### Option 3: Using nvm (Node Version Manager)

This is useful if you want to manage multiple Node.js versions:

1. **Install nvm:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **Restart your terminal** or run:
   ```bash
   source ~/.zshrc
   ```

3. **Install Node.js:**
   ```bash
   nvm install --lts
   nvm use --lts
   ```

## After Installing Node.js

Once Node.js is installed, return to the project directory and run:

```bash
cd /Users/sam/Documents/holybookproject
npm install
```

Then follow the rest of the setup instructions in README.md.
