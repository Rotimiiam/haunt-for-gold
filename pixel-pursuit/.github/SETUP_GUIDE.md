# Simple EC2 Deployment Setup

This simplified guide will get your Pixel Pursuit game deployed to EC2 with minimal steps.

## Prerequisites

- AWS account
- GitHub repository with your code
- Basic terminal/command line knowledge

## Step 1: Create EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 20.04 LTS**
3. Select **t2.micro** (free tier eligible)
4. Configure Security Group:
   - SSH (port 22) - Your IP
   - Custom TCP (port 3001) - Anywhere
5. Create/select a key pair and download the `.pem` file
6. Launch instance

## Step 2: Setup GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

### Required Secrets

- `EC2_HOST`: Your EC2 public IP address
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: Contents of your `.pem` file (copy the entire file content)

### Optional Environment Secrets (will use defaults if not set)

- `PORT`: Server port (default: 3001)
- `MAX_PLAYERS`: Maximum players per game (default: 2)
- `WINNING_SCORE`: Score needed to win (default: 500)
- `DIFFICULTY_THRESHOLD`: Points needed to increase difficulty (default: 200)

## Step 3: Setup EC2 Instance

1. Connect to your EC2 instance:

   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. Run the setup commands:

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs git
   
   # Install PM2
   sudo npm install -g pm2
   
   # Repository will be automatically cloned during first deployment
   
   # Setup PM2 to start on boot
   pm2 startup
   # Run the command that PM2 displays (it will start with 'sudo env PATH=...')
   
   # Configure firewall
   sudo ufw allow ssh
   sudo ufw allow 3001/tcp
   sudo ufw --force enable
   ```

3. **You're ready to deploy!** 
   
   The GitHub Actions workflow will automatically:
   - Clone your repository on first deployment
   - Create the .env file
   - Install dependencies  
   - Start the application with PM2

## Step 4: Deploy

Push to your main branch:

```bash
git push origin main
```

The GitHub Action will automatically:

1. Connect to your EC2 instance
2. Pull the latest code
3. Install dependencies
4. Restart the application
5. Verify it's running

## Verify Deployment

- Check application status: `pm2 status`
- View logs: `pm2 logs pixel-pursuit`
- Test health endpoint: `curl http://localhost:3001/health`
- Access your game: `http://your-ec2-ip:3001`

## Troubleshooting

### "Error: missing server host"

This means your GitHub secrets are not set correctly:

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Verify these secrets exist and have values:
   - `EC2_HOST` (your EC2 public IP)
   - `EC2_USER` (should be `ubuntu`)
   - `EC2_SSH_KEY` (contents of your .pem file)

### Deployment fails

- Check GitHub Actions logs for detailed error messages
- Verify all required secrets are set correctly
- Ensure EC2 security group allows SSH (port 22) and your app port (3001)

### Can't access the game

- Check if PM2 is running: `pm2 status`
- Check application logs: `pm2 logs pixel-pursuit`
- Verify firewall: `sudo ufw status`
- Test locally on EC2: `curl http://localhost:3001/health`

### SSH connection issues

- Verify your EC2 instance is running
- Check that your security group allows SSH from GitHub Actions IPs
- Ensure your .pem key content is copied correctly (including `-----BEGIN` and `-----END` lines)

That's it! Your game will now automatically deploy whenever you push to the main branch.
