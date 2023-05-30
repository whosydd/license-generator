# License Generator

## Requirement

The extension get `author` by `git config --get user.name`

Please confirm you already config it.

## Features

Use `explorer/context` and `command` to generate license with [GitHub license API](https://docs.github.com/en/rest/licenses)

- Generate License
- Generate MIT License

> Use `command` to generate license only in the root directory of the workspace.

## Extension Settings (Optional)

It's increases your [API rate limit](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting).

```json
// settings.json
{
  "license-generator.token": "ghp_xxx"
}
```

> You can generate token from https://github.com/settings/tokens

## Thanks

<a href="https://www.flaticon.com/free-icons/license" title="license icons">License icons created by monkik - Flaticon</a>

[ultram4rine/vscode-choosealicense](https://github.com/ultram4rine/vscode-choosealicense)
