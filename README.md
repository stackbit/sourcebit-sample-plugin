# sourcebit-sample-plugin

[![npm version](https://badge.fury.io/js/sourcebit-sample-plugin.svg)](https://badge.fury.io/js/sourcebit-sample-plugin)

> A sample plugin for [Sourcebit](https://github.com/stackbithq/sourcebit)

## 👩‍🏫 Introduction

This is a simple Sourcebit plugin for development and educational purposes. It operates on a model with three fields (`firstName`, `lastName` and `points`) and creates two entries with a pre-defined value for points. If the `watch` option is supplied, then every 3 seconds one of the entries will be randomly picked and its points will be incremented by one.

## ⚙️ Configuration

The plugin accepts the following configuration parameters. They can be supplied in any of the following ways:

- In the `options` object of the plugin configuration block inside `sourcebit.js`, with the value of the _Property_ column as a key;
- As an environment variable named after the _Env variable_ column, when running the `sourcebit fetch` command;
- As part of a `.env` file, with the value of the _Env variable_ column separated by the value with an equals sign (e.g. `MY_VARIABLE=my-value`);
- As a CLI parameter, when running the `sourcebit fetch` command, using the value of the _Parameter_ column as the name of the parameter (e.g. `sourcebit fetch --my-parameter`).

| Property        | Type    | Visibility  | Default value | Env variable | Parameter | Description                                                                         |
| --------------- | ------- | ----------- | ------------- | ------------ | --------- | ----------------------------------------------------------------------------------- |
| `mySecret`      | String  | **Private** |               | `MY_SECRET`  |           | A secret value. Not actually used by the plugin, purely for demonstration purposes. |
| `watch`         | Boolean | Public      | `false`       |              | `watch`   | Whether to update entries on a regular interval.                                    |
| `pointsForJane` | Number  | Public      | `0`           |              |           | The initial number of points assigned to Jane                                       |
| `pointsForJohn` | Number  | Public      | `0`           |              |           | The initial number of points assigned to John                                       |

### Example configuration

_sourcebit.js_

```js
module.exports = {
  plugins: [
    {
      module: require("sourcebit-sample-plugin"),
      options: {
        pointsForJane: 5,
        pointsForJohn: 3
      }
    }
  ]
};
```

## 📥 Input

_N/A_

## 📤 Output

This plugin adds normalized entries to the `objects` data bucket and normalized model objects to the `models` data bucket.
