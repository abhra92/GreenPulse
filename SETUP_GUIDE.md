# GreePlus AI Project Setup Guide

## Overview

This guide will help you set up your GreePlus AI project on GitHub following the challenge requirements.

## Prerequisites

Before you begin, ensure you have:

1. **Git installed and configured** on your system
   - Windows: `git --version` should show a version number
   - macOS/Linux: `git --version` should show a version number

2. **An active GitHub account**
   - You can create one at https://github.com/

3. **Your AI platform ready**
   - The platform where you'll be working on this project

## Step 1: Create GitHub Repository

### 1.1 Log in to GitHub
1. Visit https://github.com/
2. Click the "Sign in" button in the top-right corner
3. Enter your credentials

### 1.2 Create a New Repository
1. Click the "New repository" button on your GitHub profile page
2. Fill in the repository details:
   - **Repository name**: `greenpulse-ai` (or your preferred name)
   - **Description**: "AI-powered carbon footprint awareness platform with personalized sustainability coaching"
   - **Visibility**: Select "Public" (required by challenge)
   - **Initialize this repository with": Select "README.md"

### 1.3 Important Repository Settings
- **Branch protection**: Leave as default (main/master)
- **License**: Leave as default (MIT License)
- **Add .gitignore**: Select "Node" (since this project uses Node.js)

## Step 2: Clone Repository to Your Local System

### 2.1 Get Repository URL
1. After creating the repository, you'll be taken to the repository page
2. Click the green "Code" button
3. Copy the HTTPS URL (e.g., `https://github.com/abhra92/GreenPulse.git`)

### 2.2 Clone the Repository
Open your terminal/command prompt and run:

```bash
# Navigate to your desired directory
cd /path/to/your/projects

# Clone the repository
git clone https://github.com/abhra92/GreenPulse.git

# Change into the repository directory
cd GreenPulse
```

## Step 3: Set Up Local Repository

### 3.1 Configure Git User
Set up your Git user credentials:

```bash
# Set your user name
git config user.name "abhra92"

# Set your user email
git config user.email "abhrajoytidhara92@gmail.com"

# Verify configuration
git config --list | grep user.
```

### 3.2 Add Remote Origin
Add the GitHub repository as the remote origin:

```bash
# Add the remote origin (replace with your actual URL)
git remote add origin https://github.com/abhra92/GreenPulse.git

# Verify the remote
git remote -v
```

## Step 4: Initialize and Commit Your Code

### 4.1 Check Current Status
```bash
# Check git status
git status

# See what files are tracked
git ls-files
```

### 4.2 Add Files to Staging
Add all your project files:

```bash
# Add all files (including new, modified, and deleted files)
git add .

# Or add specific files if needed
git add README.md
```

### 4.3 Create Your First Commit
```bash
# Create a commit with a descriptive message
git commit -m "Initial commit: GreePlus AI - AI-powered carbon footprint awareness platform

- Implement carbon footprint assessment with 5-step calculator
- Add AI Sustainability Coach with Gemini API integration
- Create impact simulator for lifestyle change modeling
- Implement gamification system with levels and challenges
- Add responsive dashboard with analytics and visualizations

Co-authored-by: openhands <openhands@all-hands.dev>"
```

## Step 5: Push to GitHub

### 5.1 Push Initial Commit
```bash
# Push to the main branch
git push origin master

# Or if using main branch
git push origin main
```

## Step 6: Verify Repository Structure

### 6.1 Check Repository on GitHub
1. Visit https://github.com/your-username/greenpulse-ai
2. Verify all files are present
3. Check the commit history
4. Ensure the README.md is displayed correctly

### 6.2 Verify Branch Structure
```bash
# Check current branch
git branch

# See all branches
git branch -a
```

## Step 7: Keep Work in Single Branch

### 7.1 Working with Single Branch
The challenge requires keeping all work in a single branch. Here's how to manage this:

```bash
# Always work on the main/master branch
# Create feature branches locally if needed, but merge back before final commit

# Example workflow:
# 1. Create a feature branch locally
git checkout -b feature/initial-setup

# 2. Make changes
git add .
git commit -m "Add initial project structure"

# 3. Merge back to main
git checkout master
git merge feature/initial-setup
git branch -d feature/initial-setup

# 4. Push to GitHub
git push origin master
```

## Step 8: Repository Requirements Checklist

### 8.1 Size Requirements
- Repository size should be less than 10 MB
- Check size at: https://github.com/abhra92/GreenPulse/settings/basics

### 8.2 Branch Requirements
- Only one branch (main/master)
- No feature branches should remain

### 8.3 Public Repository
- Repository visibility must be "Public"
- Anyone can access the repository

## Step 9: Project Structure

Your repository should contain:

```
greenpulse-ai/
├── README.md
├── package.json
├── astro.config.mjs
├── src/
│   ├── components/
│   │   ├── AssessmentForm.jsx
│   │   ├── Coach.jsx
│   │   ├── Simulator.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Challenges.jsx
│   │   ├── Leaderboard.jsx
│   │   └── QuickCheck.jsx
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── assess.astro
│   │   ├── coach.astro
│   │   ├── simulator.astro
│   │   ├── dashboard.astro
│   │   ├── challenges.astro
│   │   └── leaderboard.astro
│   ├── styles/
│   │   └── global.css
│   └── assets/
├── .gitignore
└── dist/ (generated files - should be in .gitignore)
```

## Step 10: Final Verification

### 10.1 Check All Requirements
1. ✅ Repository is public
2. ✅ Repository size < 10 MB
3. ✅ Only one branch exists
4. ✅ All project files are present
5. ✅ README.md is comprehensive
6. ✅ Code is clean and maintainable
7. ✅ Git history shows meaningful commits

### 10.2 Test Your Submission
1. Visit your repository on GitHub
2. Verify the README displays correctly
3. Check that all pages load properly
4. Test the carbon calculator functionality
5. Verify the AI coach interface works

## Troubleshooting

### Common Issues

#### Repository Already Exists
If you get an error that the repository already exists:
```bash
# Delete the local directory
del greenpulse-ai (Windows)
rmdir greenpulse-ai (macOS/Linux)

# Try cloning again
git clone https://github.com/abhra92/GreenPulse.git
```

#### Authentication Errors
If you get authentication errors:
```bash
# Check your GitHub token
git config --list | grep credential.helper

# You may need to set up a personal access token
```

#### Push Errors
If you get push errors:
```bash
# Ensure you're on the correct branch
git checkout master

# Force push if necessary (use with caution)
git push origin master --force
```

## Next Steps

Once your repository is set up:

1. **Invite collaborators** if needed
2. **Create issues** for future improvements
3. **Set up GitHub Actions** for CI/CD (optional)
4. **Configure project boards** for tracking (optional)
5. **Add contributors** (optional)

## Support

If you encounter any issues:
1. Check GitHub's documentation: https://docs.github.com/
2. Visit Stack Overflow for specific error messages
3. Check the GitHub status page: https://www.githubstatus.com/
4. Contact GitHub support if needed

## Success Criteria

Your repository should meet all challenge requirements:

- [ ] Public repository on GitHub
- [ ] Less than 10 MB in size
- [ ] Only one branch (main/master)
- [ ] Complete project code
- [ ] Comprehensive README.md
- [ ] Clean and maintainable code
- [ ] Proper Git history
- [ ] All features implemented

Good luck with your GreePlus AI project! 
