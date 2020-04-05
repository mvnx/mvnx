<h1 align="center">
  mvnx
</h1>

<h3 align="center">
  :coffee: :rocket:
<h3>

<h3 align="center">
  npx for maven repos | Execute JARs from maven repositories with no strings attached.
</h3>

<p align="center">
  <a href="https://github.com/mvnx/mvnx/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/mvnx/mvnx" alt="mvnx uses the Apache License 2.0.">
  </a>
  <a href="https://www.npmjs.com/package/mvnx">
    <img src="https://img.shields.io/npm/v/mvnx" alt="Current npm package version.">
  </a>
  <a href="https://github.com/mvnx/mvnx/actions?query=workflow%3A%22Build+Master%22">
    <img src="https://github.com/mvnx/mvnx/workflows/Build%20Master/badge.svg" alt="Master build status.">
  </a>
</p>


mvnx is a JAR file executor with a catch: it obtains the JAR from local or remote Maven repositories.

  * **No Configuration Needed.** There's no need for convoluted configuration, XML files, DSLs and the usual ceremony of the JVM world. You just specifiy the Maven coordinates along with the command line arguments and mvnx will take care of the rest.
  * **Local Repository Caching.**  Artifact resolution starts in your local repository for maximum speed and minimal network usage. Downloaded artifacts are also cached in the local repository.

However, be aware of the following limitations:

  * Fat JARs only. mvnx will not perform dependency resolution.
  * Public repositories only. Maven repository login is currently not possible.

## Up and Running

There's really not much to it, no matter which method you choose:

  * [Using npx](#using-npx)
  * [Using npm -g](#using-npm--g)
  * [Using native executables](#using-native-executables)

### Using npx

If you already have [Node](https://nodejs.org/en/) (and thus [npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)) installed, you can run JARs using one command.

  1. **Execute your favorite JAR with some x-ception.**
     ~~~~
     npx mvnx com.github.ricksbrown:cowsay:1.1.0 "Hello, World!"
     ~~~~

### Using npm -g

If you don't want to type npx over and over (or just want to get rid of the startup penalty of npx) then you can install mvnx [globally with npm](https://docs.npmjs.com/downloading-and-installing-packages-globally).

  1. **Install mvnx.**
     ~~~~
     npm install -g mvnx
     ~~~~

  2. **Execute your favorite JAR.**
     ~~~~
     mvnx com.github.ricksbrown:cowsay:1.1.0 "Hello, World!"
     ~~~~

### Using native executables

If you're not a fan of Node then you might want to try the native executables published with each release:

  1. **Download the latest executable**
     * [Latest Release](https://github.com/mvnx/mvnx/releases/latest)
     * Native executables are offered for
       * Linux x64
       * Windows x64
       * MacOS x64

  2. **Execute your favorite JAR.**
     ~~~~
     mvnx com.github.ricksbrown:cowsay:1.1.0 "Hello, World!"
     ~~~~

<div align="center">
  <img src="docs/img/cowsay.png" alt="Running cowsay with mvnx.">
</div>

## Usage

~~~~
mvnx [mvnx options] <artifact> [artifact arguments]
~~~~

### mvnx options:

  * **--quiet** **-q**
    * Suppress mvnx output (except for errors) and display output only from the JVM. Very useful when piping the output of mvnx.
  * **--java-executable** **-j**
    * Custom java executable path and options. By default, mvnx will use `java` and simply append `-jar somefilename`.
  * **--ignore-local**
    * Ignore pre-existing artifacts in the local repository and attempt to download the requested artifact from the remote repository. Downloaded artifacts will not be cached in the local repository.
    * The inverse of **--only-local**.
  * **--only-local**
    * Attempt to find the requested artifact in the local repository only. Will not make requests to any remote repository.
    * The inverse of **--ignore-local**.
  * **--local-repository** **-l**
    * Path to a local repository. Will attempt to use the default local repository ~/.m2 if missing.
  * **--remote-repository** **-r**
    * URL of a remote repository. Will use Maven Central by default.
  * **--help** **--h**
    * Display the help.
      ~~~~
      mvnx --help
      ~~~~

### artifact:

  * Usual maven coordinates in the following format:
    ~~~~
    <groupId>:<artifactId>:<version>
    ~~~~

### artifact arguments

  * The arguments you want to pass to the executed JAR.

## Contributing

Contributions, regardless of their type, are always welcome in mvnx! Take a look at the [Contributing Guide](CONTRIBUTING.md) for more information.

## License

Licensed under the [Apache License 2.0](LICENSE).
