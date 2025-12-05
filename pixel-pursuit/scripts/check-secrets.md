# GitHub Secrets Checklist

Before running your deployment, make sure you have set these GitHub secrets correctly:

## Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### 1. EC2_HOST
- **Value**: Your EC2 instance's public IP address (e.g., `3.15.123.456`)
- **How to find**: AWS Console → EC2 → Instances → Select your instance → Public IPv4 address

### 2. EC2_USER
- **Value**: `ubuntu` (for Ubuntu instances)
- **Note**: This is the default username for Ubuntu EC2 instances

### 3. EC2_SSH_KEY
- **Value**: The entire contents of your .pem key file
- **Format**: Should include the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines
- **How to get**: Copy the entire content of the .pem file you downloaded when creating your EC2 instance

## Optional Environment Secrets

These will use default values if not set:

- `PORT`: Server port (default: 3001)
- `MAX_PLAYERS`: Maximum players per game (default: 2)
- `WINNING_SCORE`: Score needed to win (default: 500)
- `DIFFICULTY_THRESHOLD`: Points needed to increase difficulty (default: 200)

## Testing Your Setup

1. Push to your main branch
2. Go to Actions tab in your GitHub repository
3. Watch the deployment process
4. If you see "✅ All required secrets are set", your secrets are configured correctly
5. If you see "❌ [SECRET_NAME] secret is not set", add that secret

## Common Issues

- **Spaces in secret values**: Make sure there are no extra spaces before or after your secret values
- **Wrong EC2_HOST format**: Use just the IP address, not `http://` or any other prefix
- **Incomplete SSH key**: Make sure you copied the entire .pem file content including the header and footer lines