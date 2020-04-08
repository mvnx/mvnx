# Contributing to mvnx

First, the most important part: thanks for considering a contribution to mvnx! Oftentimes, it's the power of the community, that can make or break an open source tool.

In this short document, you'll find some practical information regarding contributions to mvnx. The kind of accepted contributions, branching strategy, code style, the usual stuff. Adhering to these guidelines is cruical to keep things consistent and moving. After all, nobody likes to explain coding style in each PR, right?

Now, let's start, shall we?

## Accepted Contributions

In what follows, a few notable forms of contribution are covered. However, we are looking for all kinds of contributions! Thus, do not hesitate to open an issue or PR, regardless of what you want to do!

### Security Vulnerabilities

If you think, that there is a security vulnerability in mvnx, then please let us know first before the public disclosure of the vulnerability. Instead of opening an issue, please drop one of the maintainers an email.

### Bug Reports

We are on a constant hunt for bugs, therefore every little help counts. The most important thing is reproducibility though:

  * Make sure to provide as much context as you can.
    * What you wanted to do. The exact steps of your workflow.
    * What was the expected and the actual outcome.
    * Exact mvnx version (artifact version if necessary), OS, architecture, etc.

Also, before creating a new bug report in form of an issue, please check if this bug has already been reported. If so, then read through the appropriate thread and comment if you can add relevant information to the discussion.

**When creating a new bug report, please add the `bug` label.**

Thank you!

### Feature Requests

Just as bug reports, feature requests are also welcome in this project! Although, we cannot cater for everyone's needs, we include as much functionality in mvnx as possible.

However, not all feature requests will make into mvnx, as it should be a focused CLI instead of another bloated tool. Please keep this in mind before opening a new issue.

**When creating a new feature request, please add the `enhancement` label.**

### Pull Requests

We cannot overstate how much you help by creating a pull request! Thank you!

Before creating a pull request though, make sure, that at least there is some corresponding feature request or open one. Also, if you want to feactor something, open a new issue first with the `refactor` label. You best bet is to pick up something with the `help wanted` or `good first issue` label.

## Support Questions

As mvnx does not have a chat currently, the issue tracker can be used for personal support requests. Just stick a `question` label on them.

## Creating a PR

Once you have something to work on, just follow the steps below:

  1. Create your own for of the repository.
  1. If you have a previous fork, please make sure to pull the latest changes.
  1. Create a new feature branch off the `master` branch. This should be named something like this:
     ~~~~
     #<corresponding-issue-number>-<kebab-case-name-of-the-issue>
     ~~~~
     Such as
     ~~~~
     #12-add-passphrase-authentication
     ~~~~
  1. Develop your feature or patch and add tests if necessary.
  1. Update the documentation if necessary.
  1. Push the feature branch.
  1. Open a new pull request in mvnx. The title should be the title of the issue including the issue number. Make sure, to have a detailed description regarding what to look for.

## Code Style

mvnx follows the [StandardJS](https://standardjs.com/) code style.

