## RavenCryptServer

### Objective
Provide the communication platform for RavenCrypt clients

This server is basally just a normal WebServer hosting a WebApi with push support via Socket.IO.
Unlike Mail, it does not communicate with other Servers, just with incoming clients, so no need for complex firewall setups.
This Server hosts the Blogs, Conversations and Files for the users.
Conversations, Files and Metadata are encrypted by the user only the Blogs are public.
You won't find any password based security here, users identify themselves by using PGP, so stealing data from it
is bad, but not really an issue. Tampering is another case, but that's what backups are for. :-)
Its mandatory to use HTTPs with this server, even for development, so there is no way to turn it off for lazy people.
HTTPS its crypto on top of crypto in this case. Its meant as an insurance policy should one crypto or the other fail.
You can never have enough crypto!

### Install
Minimal requirement:
First Install Node.JS 0.10+ and make sure the npm command works.

Then get the RavenCrypt sources.
Recommended way and also best for getting updates is cloning this project. Alternatively download the latest stable release from GitHub.

    git clone https://github.com/887/RavenCrypt.git {Path To Install Folder}

Next rename config files in config folder:

    config.example.js -> config.js           //raven crypt server setup
    config.example.json -> config.json       //database setup
    TLSOptions.example.json -> config.json   //TLS (HTTPS) setup

If you just want to help in the Development you are done here, skip ahead to FirstRun/Update
If you want to setup a real server continue with Production Setup.

### Production Setup

!PLEASE DON'T SETUP ANY SERVER UNTIL THE FIRST RELEASE!

By default everything should work fine for a minimal setup which will use SQLITE and ONE process.

If you want to host a bigger/public setup feel free to dig into the config and read this:

    For using more than one PROCESS you need to use an external Database server.
    We use Sequelize.JS as middleman to the Database, look up its docs to setup mysql/maria/postgres in config.json.
    For using more than one SERVER you need to setup Redis and configure it in lib/socket.js.

Next you need to run:

    (some sub modules may require root access so be sure to run install as root)

    //first run:
    npm install

    //update:
    npm update

Now you can set configure the environment. Sequelize installs a command line utility you should now be able to type the following command:

    sequelize -e production

In a production environment you also need to setup TLS.
The TLSOptions file comes with some instruction on how to create CSR request and there you can also change the paths to those files and setup ciphers.
If you really have no idea on how to setup HTTPS this a is a good time to get familiar with it, since any RC Server is expected to use it.
You might want to consult the Node.JS docs on this. PFS only works with node 0.11+.

Continue with FirstRun/Update!

### FirsRun/Update
First always get the latest release, either via GitHub download or by using git pull

    git pull

Install/Update all sub modules:

    npm install

Run the database Migrations

    sequelize -m

### Run

Either use the "Run" Batch/Shell Script or run:

    node server.js

