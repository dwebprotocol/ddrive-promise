# ddrive-promise

An async/await based wrapper for [ddrive](https://github.com/dwebprotocol/ddrive) (v5+)


## Install

```
$ npm install @geut/ddrive-promise
```

## Usage

`ddrive-promise` its totally [API compatible](https://github.com/dwebprotocol/ddrive#api) with ddrive v5+. It's only a promise based wrapper.

E.g.:

```javascript
const ddrive = require('@dwebcore/ddrive-promise')
const archive = ddrive('./my-first-ddrive') // content will be stored in this folder

try {
  await archive.writeFile('/hello.txt', 'world')
  const list = await archive.readdir('/')
  console.log(list) // prints ['hello.txt']
  const data = await archive.readFile('/hello.txt', 'utf-8')
  console.log(data) // prints 'world'
} catch (err) {
  console.log(err)
  // deal with the err
}

```
