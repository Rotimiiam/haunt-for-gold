# GitHub Secrets Setup Guide

## Required Secrets

You need to add these secrets to your GitHub repository:

### How to Add Secrets:
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below:

### Secrets to Add:

| Secret Name | Value |
|------------|-------|
| `SSH_HOST` | `74.207.254.40` |
| `SSH_PORT` | `22` |
| `SSH_USERNAME` | `root` |
| `SSH_PASSWORD` | `$M34Etnf@pqNHDC` |

## ⚠️ CRITICAL SECURITY STEPS

### 1. Change the Root Password IMMEDIATELY
After the first deployment, SSH into your server and change the password:
```bash
ssh root@74.207.254.40
passwd
```

### 2. Setup SSH Key Authentication (Recommended)
Instead of using passwords, use SSH keys:

```bash
# On your local machine, generate a key
ssh-keygen -t ed25519 -C "github-actions"

# Copy the public key to your server
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@74.207.254.40

# Add the PRIVATE key as a GitHub secret named SSH_PRIVATE_KEY
# Then update the workflow to use key instead of password
```

### 3. Create a Non-Root User
Running as root is dangerous. Create a dedicated deployment user:

```bash
# On your server
adduser deployer
usermod -aG sudo deployer
su - deployer
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Add your SSH public key to ~/.ssh/authorized_keys
```

## Deployment Details

- **Deploy Path**: `/var/www/haunt-for-gold`
- **Process Manager**: PM2
- **Port**: 3000 (configurable in .env)
- **Triggers**: Pushes to `main` branch or manual workflow dispatch

## First Deployment Checklist

- [ ] Add all GitHub secrets
- [ ] Ensure server has Node.js 18+ installed
- [ ] Ensure server has sufficient disk space
- [ ] Configure firewall to allow port 3000
- [ ] Setup reverse proxy (nginx/apache) if needed
- [ ] Change root password after first deploy
- [ ] Setup SSH keys
- [ ] Create non-root deployment user
