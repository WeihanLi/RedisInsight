[![Release](https://img.shields.io/github/v/release/RedisInsight/RedisInsight.svg?sort=semver)](https://github.com/RedisInsight/RedisInsight/releases)
[![CircleCI](https://circleci.com/gh/RedisInsight/RedisInsight/tree/main.svg?style=svg)](https://circleci.com/gh/RedisInsight/RedisInsight/tree/main)

# <img src="https://github.com/RedisInsight/RedisInsight/assets/99594890/333b7bbd-22ac-4457-a045-5f181e79ec50" alt="logo" width="25"/>  Redis Insight - Developer GUI for Redis, by Redis. 
[![Forum](https://img.shields.io/badge/Forum-RedisInsight-red)](https://forum.redis.com/c/redisinsight/65)
[![Discord](https://img.shields.io/discord/697882427875393627?style=flat-square)](https://discord.gg/QUkjSsk)


Redis Insight is a visual tool that provides capabilities to design, develop, and optimize your Redis application.
Query, analyse and interact with your Redis data. [Download it here](https://redis.io/insight/#insight-form)!

![Redis Insight Browser screenshot](/.github/redisinsight_browser.png)

Built with love using [Electron](https://www.electronjs.org/), [Monaco Editor](https://microsoft.github.io/monaco-editor/) and NodeJS.

## Overview

Redis Insight is an intuitive and efficient GUI for Redis, allowing you to interact with your databases and manage your data—with built-in support for Redis modules.

### Redis Insight Highlights:

* Browse, filter, visualise your key-value Redis data structures and see key values in different formats (including JSON, Hex, ASCII, etc.)
* CRUD support for Lists, Hashes, Strings, Sets, Sorted Sets, and Streams
* CRUD support for [RedisJSON](https://redis.io/json/)
* Interactive tutorials to learn easily, among other things, how to leverage the native JSON data structure supporting structured querying and full-text search, including vector similarity search for your AI use cases
* Contextualised recommendations to optimize performance and memory usage. The list of recommendations gets updated as you interact with your database
* Profiler - analyze every command sent to Redis in real-time
* SlowLog - analyze slow operations in Redis instances based on the [Slowlog](https://github.com/RedisInsight/RedisInsight/releases#:~:text=results%20of%20the-,Slowlog,-command%20to%20analyze) command
* Pub/Sub - support for [Redis pub/sub](https://redis.io/docs/latest/develop/interact/pubsub/), enabling subscription to channels and posting messages to channels
* Bulk actions - Delete the keys in bulk based on the filters set in Browser or Tree view
* Workbench - advanced command line interface with intelligent command auto-complete, complex data visualizations and support for the raw mode
* Command auto-complete support for [RediSearch](https://redis.io/search/), [RedisJSON](https://redis.io/json/), [RedisTimeSeries](https://redis.io/timeseries/)
* Visualizations of your [RediSearch](https://redis.io/search/) index, queries, and aggregations. Ability to build [your own data visualization plugins](https://github.com/RedisInsight/Packages)
* Officially supported for Redis OSS, [Redis Cloud](https://redis.io/cloud/). Works with Microsoft Azure Cache for Redis (official support upcoming)

Check out the [release notes](https://github.com/RedisInsight/RedisInsight/releases). 

## Get started with Redis Insight

This repository includes the code for Redis Insight. Check out the [blogpost](https://redis.com/blog/introducing-redisinsight-2/) announcing it. 

### Installable 
Available to download for free from [here](https://redis.io/insight/#insight-form).
Redis Insight is also available on Microsoft Store, Apple Store, Snapcraft, Flathub and [Docker](https://hub.docker.com/r/redis/redisinsight).

### Build 
Alternatively you can also build from source. See our wiki for instructions.

* [How to build](https://github.com/RedisInsight/RedisInsight/wiki/How-to-build-and-contribute)

## How to debug
If you have any issues occurring in Redis Insight, you can follow the steps below to get more information about the errors and find their root cause.

* [How to debug](https://github.com/RedisInsight/RedisInsight/wiki/How-to-debug)

## Feedback

* Request a new [feature](https://github.com/RedisInsight/RedisInsight/issues/new?assignees=&labels=&template=feature_request.md&title=%5BFeature+Request%5D%3A)
* Upvote [popular feature requests](https://github.com/RedisInsight/RedisInsight/issues?q=is%3Aopen+is%3Aissue+label%3Afeature+sort%3Areactions-%2B1-desc)
* File a [bug](https://github.com/RedisInsight/RedisInsight/issues/new?assignees=&labels=&template=bug_report.md&title=%5BBug%5D%3A)


## Redis Insight Plugins

With Redis Insight you can now also extend the core functionality by building your own data visualizations. See our wiki for more information.

* [Plugin Documentation](https://github.com/RedisInsight/RedisInsight/wiki/Plugin-Documentation)

## Contributing

If you would like to contribute to the code base or fix and issue, please consult the wiki.

* [How to build and contribute](https://github.com/RedisInsight/RedisInsight/wiki/How-to-build-and-contribute)

## Telemetry

Redis Insight includes an opt-in telemetry system, that is leveraged to help improve the developer experience (DX) within the app. We value your privacy, so stay assured, that all the data collected is anonymised.

## License 

Redis Insight is licensed under [SSPL](/LICENSE) license.

