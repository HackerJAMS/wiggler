# Deployment



## Amazon EC2 Web Server

### First Time Set-up
Launch Instance: Amazon Linux [t2.micro]

Create Key Pair (save .pem file to local machine)

### Working with EC2 Server
**ssh into server** using path to local .pem file (an alias is convenient for this)

`ssh -i ~/wiggler.pem ec2-user@ec2-52-35-116-115.us-west-2.compute.amazonaws.com`

### How to Restart the Server
`cd wiggler`

`screen -r` 

The 'screen -r' command will either load the previous screen or show a list of currently available screens. If you see a list, add the id of the most recent screen, for example `screen -r 20103`

Once the screen is loaded you generally need kill whatever process is hanging (hit ctl-c twice), and then restart node `nodemon server/server.js` (or just hit the up arrow since it should be the last command that was entered).

### Set-up Server for Node Applications
Once logged-in to the server, you can install any dependencies needed to run the app.

**Install nvm:**

`curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash`

use nvm to download the version of node you need:

`nvm install v5.1.0`

**Install global node modules:**

`nvm use 5.1`

`npm install -g bower`

`npm install -g nodemon`

** Create directory where code will be deployed to: **

`cd`

`mkdir thesis-project`

## DeployHQ ##
[DeployHQ](https://www.deployhq.com/) is a service that handles linking our github repo with the EC2 webserver.

### General Setup ###
1. create new project
2. enter url for github repo: *git://github.com/HackerJAMS/ThesisProject.git*

### Edit Server ####
1. protocol: SSH/SFTP
2. SSH Hostname: *ec2-52-33-134-152.us-west-2.compute.amazonaws.com*
3. SSH Port: 22
4. Username: *ec2-user*
5. Use SSH key rather than password for authentication -- here you'll need to copy the public key and add it to ~/.ssh/authorized_keys file on EC2 server
6. Deployment Path: */home/ec2-user/thesis-project*
7. Select branch to deploy from

#### Add config files ####
under Settings > Config Files, add .env file

#### Add post-installation script ####
under Settings > SSH Commands, add command to run *after* deployment:

`nvm use 5.1`

`cd /home/ec2-user/thesis-project`

`npm install`

`bower install`

`npm install -g gulp`

`gulp scss`

## Configure Github for Automatic Deployment ##
under Settings > Webhooks & services, go to 'Add service', select 'DeployHQ'

Copy deploy hook url from DeployHQ (under Servers & Groups):
*https://aspafford.deployhq.com/deploy/thesis-project/to/thesis-project/meroobs32dyi*

## Making the App Publicly Accessible ##
At this point our code should be updating automatically and sitting on the EC2 server at */home/ec2-user/thesis-project*

To make the app accessible at the **Public IP**, there are a few more steps we'll need to take.

### Configure Ports on EC2 ###
Under **Network & Security** (left sidebar), select **security groups**, use group with:
**80 (http)**, **22 (ssh)**, **source anywhere**

Back in terminal we'll need to enable port forwarding:

`sudo vim /etc/sysctl.conf`

*... change this line:*

\# Controls IP packet forwarding

net.ipv4.ip_forward = **1**

`sudo sysctl -p /etc/sysctl.conf`

*in .env file, PORT should be set to 8080*

`sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080`

`sudo iptables -A INPUT -p tcp -m tcp --sport 80 -j ACCEPT`

`sudo iptables -A OUTPUT -p tcp -m tcp --dport 80 -j ACCEPT`

[more info on port forwarding and serving node apps on ec2](http://www.lauradhamilton.com/how-to-set-up-a-nodejs-web-server-on-amazon-ec2)

### Running the App ###

Running `nodemon server/server.js` from the server root should now make our app available from the Public IP

#### Keep node running with 'screen' ####

However, we'll need to keep the nodemon process running after we close the terminal window. To do this we'll use the 'screen' command.

`screen`

`nodemon server/server.js`


Now nodemon should keep running after we quit the terminal. 

To get back to this screen, ssh into the ec2 server and enter `screen -r`. Now you can stop or restart the server if needed.

[more info on running node with screen](http://stackoverflow.com/questions/26245942/how-do-i-leave-node-js-server-on-ec2-running-forever)



