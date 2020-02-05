const axios = require("axios");
const pkg = require("./package.json");

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                           *
 *  📌 name (String)                                         *
 *     ====                                                  *
 *                                                           *
 *  The name of the plugin. Typically, this value is the     *
 *  same as the `name` field from `package.json`.            *
 *                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
module.exports.name = pkg.name;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                           *
 *  📌 options (Object)                                      *
 *     =======                                               *
 *                                                           *
 *  The options expected by the plugin, as an object. Each   *
 *  key represents an option. The values are objects with    *
 *  one or more of the following keys:                       *
 *                                                           *
 *  - `default` (Any): The value to be used for this option  *
 *    in case one hasn't been supplied.                      *
 *  - `env` (String): The name of an environment variable    *
 *    to read the value from.                                *
 *  - `private` (Boolean): Whether this option represents    *
 *    sensitive information and therefore should be stored   *
 *    in a `.env` file, rather than the main configuration   *
 *    file.                                                  *
 *  - `runtimeParameter` (String): The name of a runtime     *
 *    parameter (e.g. CLI parameter) to read the value from. *
 *    When present, the value of the parameter overrides any *
 *    value defined in the configuration file.               *
 *                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
module.exports.options = {
  mySecret: {
    // 👉 The value will be read from `process.env.MY_SECRET`.
    env: "MY_SECRET",

    // 👉 When running the interactive setup process, this
    // option will be stored in an `.env` file instead of the
    // main configuration file.
    private: true
  },
  watch: {
    // 👉 By default, the value of this option will be `false`.
    default: false,

    // 👉 The value for this option will be read from the `watch`
    // runtime parameter, which means that if the user starts
    // Sourcebit with `sourcebit fetch --watch`, then the value
    // of this option will be set to `true`, regardless of any
    // other value defined in the configuration file.
    runtimeParameter: "watch"
  },
  titleCase: {
    default: false
  }
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                           *
 *  📌 bootstrap (Function)                                  *
 *     =========                                             *
 *                                                           *
 *  A function to be executed once when the plugin starts.   *
 *  It receives an object with the following properties:     *
 *                                                           *
 *  - `debug` (Function): A method for printing data that    *
 *    might be useful to see when debugging the plugin.      *
 *    Data sent to this method will be hidden from the user  *
 *    unless the application is in debug mode.               *
 *  - `getPluginContext` (Function): A function for getting  *
 *    the plugin's context object.                           *
 *  - `log` (Function): A method for logging a message. It   *
 *    adds a prefix with the name of the plugin that created *
 *    it, and respects the verbosity settings specified by   *
 *    the user.                                              *
 *  - `options` (Object): The plugin options object, as they *
 *    come from the main configuration file, `.env` files    *
 *    and runtime parameters.                                *
 *  - `refresh` (Function): A function to be called whenever *
 *    there are changes in the data managed by the plugin,   *
 *    forcing the entire plugin chain to be re-executed.     *
 *  - `setPluginContext` (Function): A function for setting  *
 *    the plugin's context object                            *
 *                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
module.exports.bootstrap = async ({
  debug,
  getPluginContext,
  log,
  options,
  refresh,
  setPluginContext
}) => {
  // 👉 Get the plugin's context object. This is useful for the
  // plugin to share any data between its various methods during
  // its runtime lifecycle.
  // Additionally, it leverages Sourcebit's caching layer, which
  // means that whatever a plugin stores in its context will be
  // persisted to disk and loaded automatically on the next run.
  const context = getPluginContext();

  // 👉 If there are entries in the cache, there's nothing that
  // needs to be done right now.
  if (context && context.entries) {
    log(`Loaded ${context.entries.length} entries from cache`);
  } else {
    const { data: entries } = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    log(`Loaded ${entries.length} entries`);
    debug("Initial entries: %O", entries);

    // 👉 Adding the newly-generated entries to the plugin's
    // context object.
    setPluginContext({
      entries
    });
  }

  // 👉 If the `watch` option is enabled, we set up a polling routine
  // that checks for changes in the data source. In a real-world plugin,
  // you'd be doing things like making regular calls to an API to check
  // whenever something changes.
  if (options.watch) {
    setInterval(() => {
      const { entries } = getPluginContext();
      const entryIndex = Math.floor(Math.random() * entries.length);

      entries[entryIndex].body = entries[entryIndex].body + " (updated)";

      log(`Updated entry #${entryIndex}`);
      debug("Updated entries: %O", entries);

      // 👉 We take the new entries array and update the plugin context.
      setPluginContext({ entries });

      // 👉 After updating the context, we must communicate the change and
      // the need for all plugins to re-run in order to act on the new data.
      refresh();
    }, 3000);
  }
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                           *
 *  📌 transform (Function)                                  *
 *     =========                                             *
 *                                                           *
 *  A function to be executed once when the plugin starts    *
 *  and whenever one of the plugins triggers an update       *
 *  (i.e. by calling `refresh()` inside `bootstrap()`).      *
 *  Its purpose is to receive and transform an object that   *
 *  contains data buckets, which are arrays of entries.      *
 *  Therefore, the return value of this method must be a     *
 *  new data object.                                         *
 *  Please note that in the first execution, `transform`     *
 *  always runs after `bootstrap()`.                         *
 *  It receives an object with the following properties:     *
 *                                                           *
 *  - `data` (Object): The input data object, containing     *
 *    data buckets.                                          *
 *  - `debug` (Function): A method for printing data that    *
 *    might be useful to see when debugging the plugin.      *
 *    Data sent to this method will be hidden from the user  *
 *    unless the application is in debug mode.               *
 *  - `getPluginContext` (Function): A function for getting  *
 *    the plugin's context object.                           *
 *  - `log` (Function): An alias for `console.log` that adds *
 *    to the message information about the plugin it comes   *
 *    from.                                                  *
 *  - `options` (Object): The plugin options object, as they *
 *    come from the main configuration file, `.env` files    *
 *    and runtime parameters.                                *
 *                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
module.exports.transform = ({
  data,
  debug,
  getPluginContext,
  log,
  options
}) => {
  // 👉 Let's retrieve from the plugin's context object the
  // entries that we've created in the bootstrap method.
  const { entries } = getPluginContext();

  // Source plugins are encouraged to add information about their
  // models to the `models` data bucket.
  const model = {
    source: pkg.name,
    modelName: "sample-data",
    modelLabel: "Mock data",
    projectId: "12345",
    projectEnvironment: "master",
    fieldNames: ["firstName", "lastName", "points"]
  };

  // 👉 The main purpose of this method is to normalize the
  // entries, so that they conform to a standardized format
  // used by all source plugins.
  const normalizedEntries = entries.map(entry => {
    const title = options.titleCase
      ? entry.title
          .split(" ")
          .map(word => word[0].toUpperCase() + word.substring(1))
          .join(" ")
      : entry.title;

    return {
      ...entry,
      title,
      __metadata: model
    };
  });

  // 👉 The method must return the updated data object, which
  // in our case means appending our entries to the `objects`
  // property.
  return {
    ...data,
    models: data.models.concat(model),
    objects: data.objects.concat(normalizedEntries)
  };
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                           *
 *  📌 getSetup (Function)                                   *
 *     ========                                              *
 *                                                           *
 *  A function to be executed as part of the interactive     *
 *  setup process for this plugin.                           *
 *  It receives an object with the following properties:     *
 *                                                           *
 *  - `chalk` (Function): An instance of the `chalk` npm     *
 *    module (https://www.npmjs.com/package/chalk), used in  *
 *    the command-line interface for styling text.           *
 *  - `context` (Object): The global context object, shared  *
 *    by all plugins.                                        *
 *  - `currentOptions` (Object): The options for this plugin *
 *    present in an existing configuration file, if found.   *
 *  - `data` (Object): The data object populated by all      *
 *    previous plugins.                                      *
 *    data buckets.                                          *
 *  - `debug` (Function): A method for printing data that    *
 *    might be useful to see when debugging the plugin.      *
 *    Data sent to this method will be hidden from the user  *
 *    unless the application is in debug mode.               *
 *  - `getSetupContext` (Function): A function for getting   *
 *    the context object that is shared between all the      *
 *    plugins during the setup process.                      *
 *  - `inquirer` (Function): An instance of the `inquirer`   *
 *    npm module (https://www.npmjs.com/package/inquirer),   *
 *    used in the command-line interface to prompt questions *
 *    to the user.                                           *
 *  - `ora` (Function): An instance of the `ora` npm module  *
 *    (https://www.npmjs.com/package/ora), used in the       *
 *    command-line interface to display information and      *
 *    error messages, as well as loading states.             *
 *  - `setSetupContext` (Function): A function for setting   *
 *    the context object that is shared between all the      *
 *    plugins during the setup process.                      *
 *                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
module.exports.getSetup = ({
  chalk,
  context,
  currentOptions,
  data,
  debug,
  getSetupContext,
  inquirer,
  ora,
  setSetupContext
}) => {
  const questions = [
    {
      type: "confirm",
      name: "titleCase",
      message: "Do you want to convert the title field to title-case?",
      default: currentOptions.pointsForJane || false
    }
  ];

  // 👉 For simple setup processes, this method can simply return
  // an array of questions in the format expected by `inquirer`.
  // Alternatively, it can run its own setup instance, display
  // messages, make external calls, etc. For this, it should return
  // a function which, when executed, must return a Promise with
  // an answers object.
  return async () => {
    const spinner = ora("Crunching some numbers...").start();

    // ⏳ await runSomeAsyncTask();

    spinner.succeed();

    const answers = await inquirer.prompt(questions);

    return answers;
  };
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                           *
 *  📌 getOptionsFromSetup (Function)                        *
 *     ===================                                   *
 *                                                           *
 *  A function to be executed after the interactive has      *
 *  finished.                                                *
 *  It receives an object with the following properties:     *
 *                                                           *
 *  - `answers` (Object): The answers generated during the   *
 *    interactive setup process.                             *
 *    data buckets.                                          *
 *  - `debug` (Function): A method for printing data that    *
 *    might be useful to see when debugging the plugin.      *
 *    Data sent to this method will be hidden from the user  *
 *    unless the application is in debug mode.               *
 *  - `getSetupContext` (Function): A function for getting   *
 *    the context object that is shared between all the      *
 *    plugins during the setup process.                      *
 *  - `setSetupContext` (Function): A function for setting   *
 *    the context object that is shared between all the      *
 *    plugins during the setup process.                      *
 *                                                           *
 *  The return value of this function must be the object     *
 *  that is to be set as the `options` block of the plugin   *
 *  configuration in `sourcebit.js`.                         *
 *                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
module.exports.getOptionsFromSetup = ({
  answers,
  debug,
  getSetupContext,
  setSetupContext
}) => {
  // 👉 This is a good place to make some transformation to the
  // values generated in the setup process before they're added
  // to the configuration file.
  return {
    titleCase: answers.titleCase
  };
};
