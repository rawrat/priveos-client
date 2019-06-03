# PrivEOS-Client
Priveos javascript client library to integrate the priveos node system into your application.

## Installation

NodeJS:

    npm install priveos --save

CDN:

    <script src="https://cdn.jsdelivr.net/npm/priveos@0.1.9/dist/browser/priveos.js" integrity="sha256-vkIizQrA9btESuUm1Lmatp4FaSZHCL6uz9OMRfX5eE0=" crossorigin="anonymous"></script>
    
## Usage
In order to get up to speed in developing with privEOS, please see our [getting started guide](https://github.com/rawrat/priveos-client/wiki/Getting-started).
You can also take a look at our example applications:

* [Squeakr](https://github.com/rawrat/squeakr/): Decentralised Private Twitter
* [Data Marketplace](https://github.com/rawrat/privEOS_Demo_App): Data Marketplace where you can buy and sell data

# Development
## Global vs local packages
To not mess up with global packages, the development dependencies are listed under `devDependencies` in `package.json` - even those, that you usually would install globally. Thus, the executables for those are located in the local `bin` folder and must be made available to your terminal.

To get the path of the closest bin folder:
```
npm bin
```

Add the following to you `.bash_profile` to be able executing those scripts:
```
export PATH="${PATH}:<PATH_OF_OUTPUT_ABOVE>"
```

### Tests
To run the unit tests:

    yarn test

### Example.js
The example.js contains the basic workflow to generate a encryption key, store that encryption on the network and retreive it later. It requires a config file (see `./src/config-test.js-example`). The commands below are based on a working `babel-node` installation. Alternatively you can also build first and execute the test by running:

    yarn example

#### Config: Jungle2 Testnet
    cp config-test.js.jungle config-test.js
    babel-node example.js

### Lint
    yarn lint

### Browser
There's an example browser JS implementation at `/test.html`.