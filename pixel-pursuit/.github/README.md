# Pixel Pursuit - EC2 Deployment

This guide explains how to deploy the Pixel Pursuit game to an AWS EC2 instance using GitHub Actions.

## Quick Setup

For a simplified setup process, see the [detailed setup guide](SETUP_GUIDE.md).

## What You Need

- AWS account with an EC2 instance (Ubuntu)
- GitHub repository with your code
- 3 GitHub Secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`
- Optional: Environment variable secrets for custom configuration

## How It Works

The GitHub Actions workflow uses a simple approach:

1. **Trigger**: Runs on every push to the main branch
2. **Connect**: Uses SSH to connect to your EC2 instance
3. **Update**: Pulls the latest code from your repository
4. **Deploy**: Installs dependencies and restarts the application with PM2
5. **Verify**: Checks that the application is running correctly

## Deployment Process

```yaml
# The workflow automatically:
git pull origin main          # Get latest code
# Create .env file with configuration
npm ci --production          # Install dependencies
pm2 restart pixel-pursuit    # Restart application
curl http://localhost:3001/health  # Verify deployment
```

## Benefits of This Approach

- **Simple**: No complex deployment packages or AWS credentials needed
- **Fast**: Direct git pull is faster than file transfers
- **Reliable**: Uses proven SSH deployment methods
- **Secure**: Only requires SSH key, no AWS API access

## Troubleshooting

- **Deployment fails**: Check GitHub Actions logs and verify your secrets
- **App not accessible**: Ensure EC2 security group allows port 3001
- **PM2 issues**: SSH into EC2 and run `pm2 logs pixel-pursuit`

For detailed step-by-step instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).