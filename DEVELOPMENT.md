# Development

To not mess up with global packages, the development dependencies are listed under `devDependencies` in `package.json`. That means, that the executables are located in the local `bin` folder.

To get the path of the closest bin folder:

```
npm bin
```

Add the following to you `.bash_profile` to be able executing those scripts:

```
export PATH="${PATH}:<PATH_OF_OUTPUT_ABOVE>"
```