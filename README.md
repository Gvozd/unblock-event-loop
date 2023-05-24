# unblock-event-loop
Unblock event loop with setImmediate

# Usage

```js
import {unblock} from 'unblock-event-loop';

const tasks = Array(1e3).fill().map(async () => {
    await unblock();
    // some code blocking the event loop
});
```
