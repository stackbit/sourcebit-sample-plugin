# sourcebit-sample-plugin

[![npm version](https://badge.fury.io/js/sourcebit-sample-plugin.svg)](https://badge.fury.io/js/sourcebit-sample-plugin)

> A sample plugin for [Sourcebit](https://github.com/stackbithq/sourcebit)

## 👩‍🏫 Introduction

This is a simple Sourcebit plugin for development and educational purposes. It retrieves entries from a remote API located at [https://jsonplaceholder.typicode.com/](https://jsonplaceholder.typicode.com/). If the `watch` option is supplied, one of the entries will be randomly picked every 3 seconds and a string containing `"(updated)"` will be appended to the `body` field.

For details on how Sourcebit plugins work and the requirements for creating a new plugin, please check out [contribution guidelines](https://github.com/stackbithq/sourcebit/blob/master/CONTRIBUTING.md#creating-a-plugin).

## 🏗 Installation

To install the plugin and add it to your project, run:

```
npm install sourcebit-sample-plugin --save
```

> 💡 You don't need to run this command if you start Sourcebit using the [interactive setup process](#%EF%B8%8F-interactive-setup-process), as the CLI will install the plugin for you and add it as a dependency to your project.

## ⚙️ Configuration

The plugin accepts the following configuration parameters. They can be supplied in any of the following ways:

- In the `options` object of the plugin configuration block inside `sourcebit.js`, with the value of the _Property_ column as a key;
- As an environment variable named after the _Env variable_ column, when running the `sourcebit fetch` command;
- As part of a `.env` file, with the value of the _Env variable_ column separated by the value with an equals sign (e.g. `MY_VARIABLE=my-value`);
- As a CLI parameter, when running the `sourcebit fetch` command, using the value of the _Parameter_ column as the name of the parameter (e.g. `sourcebit fetch --my-parameter`).

| Property    | Type    | Visibility  | Default value | Env variable | Parameter | Description                                                                         |
| ----------- | ------- | ----------- | ------------- | ------------ | --------- | ----------------------------------------------------------------------------------- |
| `mySecret`  | String  | **Private** |               | `MY_SECRET`  |           | A secret value. Not actually used by the plugin, purely for demonstration purposes. |
| `watch`     | Boolean | Public      | `false`       |              | `watch`   | Whether to update entries on a regular interval.                                    |
| `titleCase` | Boolean | Public      | `false`       |              |           | Whether to convert the value of the `title` field to title-case                     |

### 👀 Example configuration

_sourcebit.js_

```js
module.exports = {
  plugins: [
    {
      module: require("sourcebit-sample-plugin"),
      options: {
        titleCase: true
      }
    }
  ]
};
```

### 🧞‍♂️ Interactive setup process

This plugin offers an interactive setup process via the `npx create-sourcebit` command.

## 📥 Input

_N/A_

## 📤 Output

This plugin adds normalized entries to the `objects` data bucket and normalized model objects to the `models` data bucket.

## 👷🏻‍♀️ Development

The `example` directory contains a basic installation of Sourcebit with this sample plugin installed and configured. It's a good way to develop a plugin locally.

To run it, run:

```shell
cd example
npm install

# Run Sourcebit in the command-line
npm run sourcebit-cli

# Run Sourcebit in a Node.js application
npm run sourcebit-node
```
