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
  <a href="https://www.npmjs.com/package/mvnx">
    <img src="https://img.shields.io/badge/npx-mvnx-brightgreen" alt="Run with npx.">
  </a>
  <a href="https://github.com/mvnx/mvnx/actions?query=workflow%3A%22Build+Master%22">
    <img src="https://github.com/mvnx/mvnx/workflows/Build%20Master/badge.svg" alt="Master build status.">
  </a>
</p>

<div align="center">
  <img src="docs/img/cowsay.png" alt="Running cowsay with mvnx.">
</div>

**Table of Contents**

  * [Feautres](#features)
  * [Up and Running](#up-and-running)
  * [CLI Usage](#cli-usage)
  * [Configuration File](#configuration-file)
  * [mvnx :heart: GitHub Packages](#mvnx-heart-github-packages)
  * [Remote Repository Alias](#remote-repository-alias)
  * [Remote Repository Authentication](#remote-repository-authentication)
  * [Contributing](#contributing)
  * [License](#license)

## Features

mvnx is a JAR file executor with a catch: it obtains the JAR from local or remote Maven repositories.

  * **No Or Minimal Configuration Needed.** There's no need for convoluted configuration, XML files, DSLs and the usual ceremony of the JVM world. If you use Maven Central, then just specify the Maven coordinates along with the command line arguments and mvnx will take care of the rest.
  * **Local Repository Caching.**  Artifact resolution starts in your local repository for maximum speed and minimal network usage. Downloaded artifacts are also cached in the local repository.
  * **Authentication Support.** mvnx supports HTTP Basic Authentication to remote maven repositories. This is required by repositories such as those of GitHub Packages. This feature needs a bit of a configuration though. See [Remote Repository Authentication](#remote-repository-authentication).
  * **Remote Repository Alias and Prefix.** Remote repository URLs can be given aliases. With a proper alias set, you can do things like
    ~~~~
    mvnx gpr/OWNER/REPO/artifactId:groupId:version
    ~~~~
    which will expand into something like this
    ~~~~
    mvnx http://maven.pkg.github.com/OWNER/REPO/artifactId:groupId:version
    ~~~~
    Magic! :unicorn: See [mvnx :heart: GitHub Packages](#mvnx-heart-github-packages) and [Remote Repository Alias](#remote-repository-alias)
  * **Latest Version Retrieval.** If you don't need a specific version of some artifact then mvnx will automatically get the latest available version. Just omit the version coordinate!

However, be aware of the following limitation:

  * Fat JARs only. mvnx will not perform dependency resolution.

## Up and Running

There's really not much to it, no matter which method you choose:

  * [Using npx](#using-npx)
  * [Using npm -g](#using-npm--g)
  * [Using native executables](#using-native-executables)

### Using npx

If you already have [Node](https://nodejs.org/en/) (and thus [npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)) installed, you can run JARs using one command.

  1. **Execute your favorite JAR with some x-ception.**
     ~~~~
     npx mvnx com.github.ricksbrown:cowsay "Hello, World!"
     ~~~~

### Using npm -g

If you don't want to type npx over and over (or just want to get rid of the startup penalty of npx) then you can install mvnx [globally with npm](https://docs.npmjs.com/downloading-and-installing-packages-globally).

  1. **Install mvnx.**
     ~~~~
     npm install -g mvnx
     ~~~~

  2. **Execute your favorite JAR.**
     ~~~~
     mvnx com.github.ricksbrown:cowsay "Hello, World!"
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
     mvnx com.github.ricksbrown:cowsay "Hello, World!"
     ~~~~

## CLI Usage

~~~~
mvnx [mvnx options] <artifact> [artifact arguments]
~~~~

### Examples

  * Query the latest version. Does not work if `--ignore-local` is set.
    ~~~~
    mvnx gro.up:artifact
    ~~~~
  * Suppressing the mvnx output and passing multiple arguments to the JAR.
    ~~~~
    mvnx -q gro.up:artifact:1.1.0 --will -b -passed="to the JAR"
    ~~~~
  * Querying a custom repository instead of Maven Central. In this case, you should specify the base path of the repository, mvnx will take care of the actual path to the requested artifact.
    ~~~~
    mvnx https://custom.repository:8080/groupId:artifactId "A single string argument"
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
  * **--help** **--h**
    * Display the help.
      ~~~~
      mvnx --help
      ~~~~

### artifact:

  * Usual maven coordinates extended with a repository specification:
    ~~~~
    [remote repository URL or identifier/]<groupId>:<artifactId>[:version]
    ~~~~
  * If `version` is omitted, then mvnx will attempt to retrieve the latest version from the remote repository. Note, that this feature does not work if the `--only-local` flag is set.
  * If no remote repository is specified, then mvnx will query the Central Repository.

### artifact arguments

  * The arguments you want to pass to the executed JAR.

## Configuration File

Although, you can run mvnx with absolutely no persistent configuration, you can make your life much easier by creating a configuration file. In the configuration file, you can

  * set remote repository credentials,
  * set remote repository aliases.

mvnx will search for this file at

~~~
[local-repository]/mvnx.json
~~~

where `local-repository` is the value of the `--local-repository` option (`~/.m2` by default).

An empty configuration file should look like this:

~~~~JSON
{ 
  "servers": [

  ]
}
~~~~

## mvnx :heart: GitHub Packages

If you want to easily make use of GitHub Packages, add the following entry to the [configuration file](#configuration-file) (by default located at `~/.m2/mvnx.json`):

~~~~JSON
{
  "servers": [
    {
      // Or any other prefix you prefer.
      "id": "gpr",
      "isPrefix": true,
      "url": "https://maven.pkg.github.com/$$",
      "username": "Your GitHub Handle",
      // GitHub Personal Access Token.
      // You can create one at https://github.com/settings/tokens
      "password": "some-token"
    }
  ]
}
~~~~

Then, you can use this alias as follows to retrieve any public (more precisely, visible for you) JARs:

~~~~
mvnx gpr/OWNER/REPO/groupId:artifactId:version
~~~~

## Remote Repository Alias

Aliases can be set in the mvnx configuration file.

### Creating an Alias

An alias can be created by adding a new entry to the [configuration file](#configuration-file):

~~~~JSON
{
  "servers": [
    {
      // The alias you want to use in the command line.
      "id": "alias", 
      // The URL of the remote repository.
      "url": "http://url.repository"
    }
  ]
}
~~~~

Now you're free to use the value of the `id` field instead of the URL as follows:

~~~~
mvnx alias/artifactId:groupdId:version
~~~~

### Creating a Prefix

A prefix is a more capable alias with substitution functionality. It's a great solution for services like GitHub Packages. Let's assume that you want

~~~~
mvnx prefix/team-a/artifact:groupId
~~~~

and

~~~~
mvnx prefix/team-b/artifact:groupId
~~~~

to use the remote repositories `http://private.repository/teams/team-a/maven2` and `http://private.repository/teams/team-b/maven2`. Then, you can create a new prefix as follows:

~~~~JSON
{
  "servers": [
    {
      // The prefix to be used on the command line. mvnx will recognize the substitution by seeing this string.
      "id": "prefix",
      // Mandatory.
      "isPrefix": true,
      // The URL to substitute into.
      // $$ will be replaced with the repository identifier (for example "prefix/team-a")
      // with the prefix removed.
      "url": "https://private.repository/teams/$$/maven2"
    }
  ]
}
~~~~

## Remote Repository Authentication

For remote authentication using HTTP Basic, you have three options:

  * [Using Environment Variables](#using-environment-variables)
  * [Using mvnx.json](#using-mvnx.json)
  * [Using settings.xml and mvnx.json](#using-settings.xml-and-mvnx.json)

### Using Environment Variables

Simply set the following two environment variables:

  * `MVNX_REMOTE_USERNAME`,
  * `MVNX_REMOTE_PASSWORD`

Ideal for CI workflows.

### Using mvnx.json

You can also set the credentials in the [configuration file](#configuration-file), see [Remote Repository Alias](#remote-repository-alias) for more details) as follows:

~~~~JSON
{
  "servers": [
    {
      "id": "optional alias",
      "url": "The URL of the remote repository.",
      "username": "Username for the repository.",
      "password": "Password for the repository."
    }
  ]
}
~~~~

You may also set an `id` if you want to use an alias. Going forward, mvnx will always use the specified credentials if the appropriate remote repository is queried.

This approach works best if

  * you don't have maven installed,
  * or maven is available but you don't want to tinker with the maven `settings.xml`.

### Using settings.xml and mvnx.json

Let's assume, that you already have the following server in your `settings.xml`:

~~~~XML
<server>
  <id>some-server</id>
  <username>user</username>
  <password>pw</password>
</server>
~~~~

In this case, to re-use these credentials, instead of copy-pasting them, you can create the following mvnx configuration entry:

~~~~JSON
{
  "servers": [
    {
      // Must be the same as the on in settings.xml!
      "id": "some-server",
      "url": "The URL of the remote repository."
    }
  ]
}
~~~~

By using the same id in both the `settings.xml` and the `mvnx.json`, mvnx will be able to load the appropriate credentials.

This approach is great if you don't want to set credentials twice.

## Contributing

Contributions, regardless of their type, are always welcome in mvnx! Take a look at the [Contributing Guide](CONTRIBUTING.md) for more information.

## License

Licensed under the [Apache License 2.0](LICENSE).
