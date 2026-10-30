# Publishing Guide for ASCII Studio

## How to Push Updates to the Repository

Follow these steps whenever you want to publish changes to the GitHub repository.

### 1. Configure Git Identity (First time only)

```bash
git config --global user.email "your.email@example.com"
git config --global user.name "Your Name"
```

### 2. Make Your Changes

Edit the files you need to change. When you're ready to publish:

### 3. Stage and Commit Changes

```bash
# Stage all changed and new files
git add -A

# Commit with a descriptive message
git commit -m "Your commit message here"
```

### 4. Push to Remote

```bash
# If this is the first push or branch hasn't been tracked:
git push -u origin main

# If the branch is already tracked:
git push
```

### 5. Verify the Push

Visit your repository on GitHub to confirm the changes are visible:
https://github.com/rpkirchin-creator/ascii-forge

---

## Best Practices

- **Commit messages**: Use clear, descriptive messages that explain what changed
- **Small commits**: Break up large changes into logical, focused commits
- **Test locally**: Run `npm run dev` to verify your changes work before pushing
- **Pull before pushing**: If others are working on the repo, run `git pull` before pushing to avoid conflicts
- **Ignore sensitive data**: Never commit API keys, passwords, or personal info

---

## Common Scenarios

### First Time Setup (already done):
```bash
git init
git add -A
git commit -m "Initial commit: ASCII Studio - Linux Image to ASCII Art Converter"
git remote add origin https://github.com/rpkirchin-creator/ascii-forge.git
git push -u origin main
```

### Adding New Features:
```bash
# Make changes to files...
git add -A
git commit -m "Add new feature: description of what was added"
git push
```

### Fixing Bugs:
```bash
# Make bug fix changes...
git add -A
git commit -m "Fix: description of the bug fix"
git push
```

---

## Files in the Repository

This project contains:
- `src/` - React/Vite application source code
- `src/components/` - UI components
- `src/utils/` - Utility modules (asciiConverter, constants, sampleImages)
- `package.json` - Dependencies and scripts
- `README.md` - Project documentation
- `STUDENT_GUIDE.md` - Educational documentation
- Configuration files (`vite.config.ts`, `tsconfig.json`, `.env.example`)