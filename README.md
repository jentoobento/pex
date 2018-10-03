# pex
transform errors

Takes an error object which may or may not have nested arrays or objects inside it.
Returns a flattened object without the nested structure.
Unless the error object key is 'url' or 'urls' then, the nested structure will be preserved.
Allows optional parameter of an array where keys specified will have a preserved nested structure.



Example:

```js
// original error object
let error = {
  name: ['This field is required', 'Another error'],
  age: ['Only numeric characters are allowed'],
};

// transformed
error = {
  name: 'This field is required. Another error.',
  age: 'Only numeric characters are allowed.'
};
```

In case the errors are nested, you need to make sure that concatenated string won't have recurring errors. The nested structures could be both objects and arrays. The nested structures are not preserved, transformed object should have flat structure by default.

Example:
```js
// original error object
let error = {
  name: {
    first: ['Only alphanumeric characters are allowed'],
    last: ['Only alphanumeric characters are allowed'],
  },
  names: [{}, {
    first: ['Only alphanumeric characters are allowed'],
    last: ['Only alphanumeric characters are allowed'],
  }, {}],
};

// transformed
error = {
  name: 'Only alphanumeric characters are allowed.',
  names: 'Only alphanumeric characters are allowed.',
};
```

Sometimes, preserving nested structures could be useful when rendering errors on the screen. One of your implemented functions should take one or more arguments that specify the keys of error object for which you want to preserve the nested structure.

For example, if you want to preserve nested structure for field `names`, the transformed object should look like:
```js
error = {
  name: 'Only alphanumeric characters are allowed.',
  names: [{}, {
    first: 'Only alphanumeric characters are allowed.',
    last: 'Only alphanumeric characters are allowed.',
  }, {}],
```
