Easy-DnD is a drag and drop implementation for Vue.js 2 that uses only standard mouse events instead of the HTML5 drag and drop API, which is [impossible to work with](https://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html). Think of it as a way to transfer data from some components to others using the mouse or support for a mouse assisted copy/cut - paste. It also allows for lists to be reordred by drag and drop.

# Demos

These demos are meant to be pretty and reflect real life examples. For more barebones examples, see the manual.

The following demo features list reordering, drag and drop between two lists, custom drag images and custom feedback when inserting new items. It uses Vuetify components.

https://codesandbox.io/s/easy-dnd-demo-9mbij

![demo](img/vid7.gif)

The following demo features drag and drop between a table and a list, custom drag images and a custom style for drop areas when the drop is allowed. It uses Vuetify components.

https://codesandbox.io/s/easy-dnd-demo-2-ozs8b

![demo](img/vid8.gif)

# Manual

## Overview

There are four components : Drag, Drop, DropMask and DropList.

The Drag component is meant to define an area from which data can be exported. The Drop component is meant to define an area into which data can be imported. Drop components can be nested forming hierarchies of arbitrary depth. The DropMask component is meant to create an island insensitive to drag and drop on top of a Drop component. The DropList component is a special kind of drop component that displays a list of items that supports dragging into and reordering.

## Events

All events carry the current state of the drag operation by means of the following properties :

* `type` : the type of the data being transfered
* `data` : the data being transfered
* `position` : the current position of the mouse cursor
* `top` : the foremost Drop component currently under the mouse cursor if any
* `previousTop` : for dragenter and dragleave, the previous value of top if any 
* `source` : the Drag component where the drag originated

Drag components emit the following events :

* `dragstart` : triggered when a drag operation starts
* `dragend` : triggered when a drag operation terminates (whether successfuly or not)
* `cut` / `copy` : triggered when a drag operation completes successfuly on a Drop component that requires the data to be removed / copied

Drop components emit the following events :

* `dragenter` : triggered when the mouse enters a Drop component
* `dragleave` : triggered when the mouse leaves a Drop component
* `dragover` : triggered when the mouse moves over a Drop component
* `drop` : triggered when a drop operation completes on a Drop component

DropList components emit the following events (in addition to the ones emitted by Drop components) :

* `insert` : triggered when data is to be inserted into the list (properties : `type`, `data` and `index`)
* `reorder` : triggers when data needs to be reordered (properties : `from`, `to` and `apply` - apply is a function that applies the required reordering to the given array)

## Data

Export : the data being exported when a drag operation originates from a Drag component is defined by mean of its `data` property.
Import : when a drag operation terminates in a Drop components, its `drop` event is triggered and the event carries the `data` to be imported.

## Modes

A drag and drop can occur in several possible modes, depending on its effect on the origin of the drag :

* `copy` (the default) : if the source of the drag is unaffected by the drag operation,
* `cut` : if the source of the drag is to be removed when the drag operation completes.

Drop components must declare what mode must be triggered when data is dropped into them using the `mode` property.

Every Drag components support the `copy` mode and may declare a `@copy="..."` listener, but only Drag components that declare a `@cut="..."` listener support the `cut` mode. That listener will be called if a drag operation completes on a Drop component that declares the `cut` mode.

The following demo illustrates modes in action :

https://codesandbox.io/s/example-2-r8n1k

![demo](img/vid3.gif)

## Types

A drag operation **may** have a type. The type is a data structure (can be a simple string) that defines the kind of data being transfered. The type of a drag operation is defined by the Drag component that initiates it using the `type` prop.

A Drop component is said to participate in a drag operation if it accepts its type (the default is to accept any type). The type(s) a Drop component accepts can be defined by mean of the `accept-type` prop (can be a string, an array of string or a function that takes the type as parameter and returns a boolean).

As far as Easy-DnD is concerned, if a Drop component doesn't accept the type of the current drag operation, it behaves like any other part of the page that is not sensitive to drag and drop. It is ignored during the drag, no special CSS classes are applied, no special cursors / drag images are displayed and no special events are triggered.

The following demo illustrates the use of types. There are two types in use : 'string' and 'number'. The Drag components that contain '1' and '2' are of type 'number', the ones containing 'a' and 'b' are of type 'string'. The two Drop components on the left accept numbers, the ones on the right accept strings. When you drag a number/string (respectively), only Drop components that accept numbers/strings (respectively) react (i.e. drag images, CSS classes, cursors are applied). The other ones are left alone.

https://codesandbox.io/s/example-3-g7io8

![demo](img/vid4.gif)

## Data validation

The following demo defines five Drag components that can be dragged into three Drop components, one that accepts even numbers, one that accepts odd numbers and one that accepts any number but removes them once the drag is complete.

https://codesandbox.io/s/easy-dnd-demo-fo078

![demo](img/vid1.gif)

### Mouse cursor

If a drag isn't in progress, the cursor turns into `grab` when the mouse is over a Drag component. If a drag is in progress, the cursor turns into `grabbing`, unless it is over a Drop component that accepts the type of the current drag operation. Then, it turns into `pointer` if the Drop component accepts the data being dragged, and into `not-allowed` otherwise.

### Drag image

During the drag, an image may move along the mouse cursor. Easy-DnD makes it so that this image is always on top of everything else. The Drag component provides a slot that can be used to set the default image displayed during the drag operation :

* if the slot isn't defined, the image is a clone of the Drag component.
* if the slot is defined and empty, there is no image.
* if the slot is not empty, a clone of its content is used.

The Drop component provides a slot that can be used to set the image to be displayed when the mouse is over it, if the Drop component participates in the current drag operation (i.e. it accepts its type) :

* if the slot isn't defined, the default image set by the Drag component is used.
* if the slot is defined and empty, there is no image.
* if the slot is not empty, a clone of its content is used.

The position of the drag image relative to the mouse cursor can be controlled by CSS using the transform property.

The following demo illustrate the use of custom drag images, nested Drop components and a mask :

https://codesandbox.io/s/example-4-6h8zy

![demo](img/vid5.gif)

### CSS classes

A Drag component is assigned the class `drag-in` when the mouse is over it and a drag operation isn't in progress, `drag-out` otherwise.

During a drag operation, the Drop components on the page are assigned several CSS classes :

* for all Drop components : `type-allowed` if the Drop component accepts the type of the drag operation, `type-forbidden` otherwise
* for the Drop components that participate in the drag operation (i.e. accepts its type) :
  * `drop-in` when the mouse is over one that is foremost at the current mouse position (remember Drop components can be nested), `drop-out` otherwise
  * `drop-allowed` when the Drop component accepts the data and the source of the drag accepts its mode, `drop-forbidden` otherwise

## Components
  
### DropMask component

The following demo illustrates the use of a DropMask :

https://codesandbox.io/s/example-1-ngrlv

![demo](img/vid2.gif)
  
### DropList component

The DropList component is a special Drop component so it inherits all the props and events of the Drop component. It can be used when the result of a drag operation is to import data into the component as an item in a list or to allow the user to reorder a list of items using drag and drop.

Comparing to the Drop component, there are two more events :
* `insert` : emitted when the user drops data into the DropList. The index where the new item should be inserted is available in the `index` property. If no listener is provided for this event, then the DropList can't be dropped into.
* `reorder` : emitted when the user reorders the list. The index to be removed is available in the propery `from` and the index where the item must be reinserted is available in the property `to`. The property `apply` contains a function that applies the required reordering to the given array. If no listener is provided for this event, then the DropList can't be reordred.

Comparing to the Drop component, there is two more slots : `item` and `feedback`.

The `item` slot is used to render each list item. It has two properties, `item` and `reorder`. Reorder is true when the item is the one subject to reordering.

The `feedback` slot is used to render a placeholder to show the position where the new item would be inserted if the drag operation ended in the current mouse position. It has two properties : `type` and `data`.

The `drag-image` slot also gains a new property : `reorder`. That property is true when the list is being reordered. It can be used to provide a different drag image depending on whether the list is being drop into or reordered. Before the content of the `drag-image` slot is cloned to serve as a drag image, it is briefly inserted into the list so that its dimensions can depend on the ones of the list.



## Mixins

### DragAwareMixin

A mixin is available to make components sensitive to drag operations. It adds the following computed fields to components that incorporate it :

* `dragInProgress` : true if a drag operation is in progress, false otherwise
* `dragType` : the type of the current drag operation
* `dragData` : the data of the current drag operation
* `dragPosition` : the current position of the mouse relative to the document

The following demo displays information about the current drag operation when it is in progress :

https://codesandbox.io/s/example-5-j8qo9

![demo](img/vid6.gif)

# API

## Events

Every event described in the following sections emits a data structure with the following fields :

* `type` : the type of the current drag operation
* `data` : the data of the current drag operation
* `mouse` : the native mouse event that triggered this custom event

## Drag

### Props

* `tag` : element used as root for the template of the Drag component
  * default value : div
  * type : String (for html tags) or Object (for Vue components)
* `type` : type of the data being dragged when the drag operation originates from this component
  * default value : null
  * type : any
* `data` : data being dragged when the drag operation originates from this component
  * default value : null
  * type : any

### Slots

* `drag-image` : content to be cloned and used as a drag image displayed along the mouse cursor during the drag

### Events

* `dragstart` : emitted when the drag starts, first event of all
* `dragend` : emitted when the drag ends, last event of all
* `cut` or `copy` (or any custom mode) depending on the mode of the Drop component that terminated the drag operation

## Drop

### Props

* `tag` : element used as root for the template of the Drag component
  * default value : div
  * type : String (for html tags) or Object (for Vue components)
* `accepts-type` : defines the type(s) that the Drop component accepts as import data
  * default value : () => true (i.e. accepts any type)
  * type : string, string[] or {(type) : boolean}
* `accepts-data` : defines the data that the Drop component accepts as import data
  * default value : () => true (i.e. accepts any data)
  * type : {(data, type) : boolean}
* `cursor` : the mouse cursor to use when the mouse is above the Drop component and the drop is allowed
  * default value : `pointer`
  * type : 
* `mode` : the mode of the Drop component
  * default value : `copy`
  * type : string

### Slots

* `drag-image` : content to be cloned and used as a drag image displayed along the mouse cursor during the drag when the mouse cursor is above the Drop component

### Events

* `dragenter` : emitted during a drag operation when the mouse cursor enters a Drop component
* `dragleave` : emitted during a drag operation when the mouse cursor leaves a Drop component
* `dragover` : emitted during a drag operation when the mouse cursor move over a Drop component
* `drop` : emitted when a drop operation completes in a Drop component

## Building from source

At the root of the repository, execute the command `npm run build`. The result of the build is in the directory `lib/dist`.

## Test application

At the root of the repository is a webapp that can be used to test the components. To run it, execute the command `npm run serve` at the root of the repository.















