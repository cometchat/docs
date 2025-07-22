# CometChat Documentation

This repository contains the source code for [CometChat's Documentation](https://www.cometchat.com/docs).

We welcome contributions from the community! If you'd like to contribute to the CometChat documentation, please read our [Contributing Guidelines](CONTRIBUTING.md).

## Quick Start for Contributors

1. Fork this repository
2. Create a new branch for your changes
3. Make your changes to the documentation
4. Submit a pull request

For more detailed instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in this project.

## Documentation Structure

The documentation is organized into the following main sections:

- **Fundamentals** - Core concepts, features, and implementation guides
- **UI Kit** - Integration guides for pre-built UI components across web and mobile platforms
- **SDK** - Comprehensive SDK documentation for all supported platforms
- **REST APIs** - Complete API reference for server-side implementation
- **AI Chatbots** - Implementation guides for AI-powered conversational interfaces
- **Moderation** - Tools and features for content moderation
- **Notifications** - Push/Email/SMS notification integration and management across platforms
- **Widget** - Pre-built chat widget implementation for websites
- **Articles** - In-depth guides, migration information, and best practices

## Issues and Feedback

If you find any issues with the documentation or have suggestions for improvement, please [submit an issue](https://github.com/cometchat/docs/issues/new/choose).

### Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command

```
npm i -g mint
```

Run the following command at the root of your documentation (where docs.json is)

```
mint dev
```

#### Troubleshooting

- Mintlify dev isn't running - Run `npm i -g mint@latest` it'll re-install dependencies.
- Page loads as a 404 - Make sure you are running in a folder with `docs.json`
