#!/bin/bash

echo "Starting EC2 setup for Pixel Pursuit deployment..."

# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git

# Install PM2 globally
sudo npm install -g pm2

# Clone your repository (you'll need to replace with your actual repo URL)
echo "Please run this command manually after the script completes:"
echo "git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git ~/pixel-pursuit"
echo ""

# Set up PM2 to start on boot
pm2 startup
echo "Run the command that PM2 startup just displayed (with sudo)"

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 3001/tcp
sudo ufw --force enable

echo ""
echo "EC2 setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git ~/pixel-pursuit"
echo "2. Run the PM2 startup command that was displayed above"
echo "3. Create a .env file in ~/pixel-pursuit/ with your environment variables"
echo "4. Test your first deployment by pushing to your main branch"