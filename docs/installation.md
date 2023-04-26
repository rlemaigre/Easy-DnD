# Installation

## About
Easy-DnD is a drag and drop implementation for Vue that uses only standard mouse events instead of the HTML5 drag and drop API, which is [impossible to work with](https://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html).

Think of it as a way to transfer data from some components to others using the mouse or support for a mouse assisted copy/cut - paste. It also allows for lists to be reordered by drag and drop.


## Installation

Install via [npm](https://npmjs.com) or [yarn](https://yarnpkg.com)


### Vue 3

```
# Use npm
npm install vue-easy-dnd@latest --save

# Use yarn
yarn add vue-easy-dnd@latest

(REQUIRED FOR Vue 3): Make sure to import the generated CSS file
import 'vue-easy-dnd/dist/dnd.css'
Vue 3 also relies on the Options API and mixins. So make sure you have enabled the Options API in your project (enabled by default)
```


### Vue 2
The Vue2 variant is no longer maintained. Please use with caution.
```
# Use npm
npm install vue-easy-dnd@^1 --save

# Use yarn
yarn add vue-easy-dnd@^1
```

