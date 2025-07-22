# CometChat Docs

This repo contains the source code for [CometChat's Documentation](https://www.cometchat.com/docs).

Please open Pull Requests to suggest helpful changes!

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