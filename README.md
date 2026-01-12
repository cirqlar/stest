# Using this code

A screen recording showing the app's functionality can be found [here](https://drive.google.com/file/d/1Bu6qABCdjJMguxrYeuBJ3pqtNwFSsLYy/view?usp=sharing)

### 1. Setup Environment

[Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) for React Native

### 2. Start the metro server:

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start
```

### 3. Build and run the app

#### For Android

```sh
# Using npm
npm run android
```

#### For iOS

For iOS, remember to install CocoaPods dependencies.

The first time you run this project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

And then you can run the app with:

```sh
# Using npm
npm run ios
```

# Tests

There are currently no tests.

# Architecture

#### State Management

- [Tanstack Query](https://tanstack.com/query/latest) is used to cache and manage database queries.
- [Zustand](https://github.com/pmndrs/zustand) is used for global state.
- [AsyncStorage](https://github.com/react-native-async-storage/async-storage) is used to store minor data that doesn't benefit from being in the database

#### Database

Please see `src/db/migrations` to understand how the database is layed out.

#### Performance

- [op-sqlite](https://github.com/OP-Engineering/op-sqlite): a very fast sqlite adapter is used to minimize query latency
- The database is also indexed to improve retrieval times.
- Tanstack Query ensures queries do not rerun needlessly. Some queries are also configured to reuse data from broader queries.

# Further Work

#### Testing

I unfortunately could not get to testing within the alloted time. While the application works, there is no doubt that edge cases that I hadn't considered, and could be caught by testing, exist.

Things that should be tested:

- Migrations: for name uniqueness to prevent clashing, as well as ensuring they all run without errors.
- Mutations: for correct application as well as ensuring related queries are properly invalidated.

#### Error Handling

There is very little consistency in error handling. Some possible improvements:

- Better consistency
- Consider [Effect](https://github.com/Effect-TS/effect) which could make error handling more straightforward.

#### Styling

The styling is servicable but inconsistent with much repitition. Creating a style guide with reusable colors and sizes, as well as reusable styled container/basic components would be a good improvement. A styling library might also be worth considering.

#### Time

I believe I underestimated how much work was required which resulted in an incomplete submission. Better time management as well as automation of some of the work would have been useful.

#### Database

`op-sqlite` has a [reactive queries feature](https://op-engineering.github.io/op-sqlite/docs/reactive_queries) that might be useful for ensuring queries refetch when the database updates.
