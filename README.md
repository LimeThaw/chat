# chat
A small chat webapp using websockets

The app runs using [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/). To start it up simply clone it and run the `./compose.sh` script. The app uses ports 80, 443, and 5000, so these need to be open.

By default the app uses the secure protocols https and wss, and the repository contains self-signed certificates that will not be trusted by any reasonable peice of software without specific settings. To deploy the app, you can generate your own certificate and private key, e.g. with [Let's Encrypt](https://letsencrypt.org/).

The frontend uses [Bootstrap](https://getbootstrap.com/), [Less](http://lesscss.org/), and [jQuery](https://jquery.com/), all of which are included via CDNs. It is served using a simple [nginx](https://www.nginx.com/) container.

The backend is a small [python](https://www.python.org/) server listening for [websocket](https://websockets.readthedocs.io/en/stable/intro.html) requests, keeping track of users, and relaying messages. No messages are stored.
