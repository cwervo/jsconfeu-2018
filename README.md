# "Pore" - An Art Installation


Note: `aframe-meshline-component-local` is the compiled version [this custom meshline component](https://github.com/AndresCuervo/cwervo-custom-aframe-meshline-component), with an overhauled `yarn dist` command

A WebVR art installation for JSConf EU 2018.

---

Technical bits:

This project is created with Parcel.

To start a local server use:

```
parcel index.html
```


To generate a build to host on this GH repo, run:

```
parcel build index.html --out-dir docs --public-url "."
```

(note: `--public-url "."` tells Parcel to use relative paths)
