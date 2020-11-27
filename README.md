# react-outliner

A Workflowy-style outliner UI component for React.

I'm live streaming development of this component on Twitch!

Check Twitch for the next live stream:

[https://www.twitch.tv/ashleydavis](https://www.twitch.tv/ashleydavis)

See my YouTube channel to watch previous live streams:

[https://www.youtube.com/c/thedatawrangler](https://www.youtube.com/c/thedatawrangler)

Follow me on Twitter for updates and announcements:

[https://twitter.com/ashleydavis75](https://twitter.com/ashleydavis75)

## Use it

Install it in your React application:

```bash
npm install --save react-outliner
```

Import it in your React code:

```javascript
import { Outliner } from "react-outliner";
```

Use it in your `render` function:

```javascript
    <Outliner notes={notes} />
```

For notes you can start with an empty array, you can create an array/tree of notes or you can load data from a database.

Each note must have an id that is locally unique with in the notes data structure.

Here's an example setup to get started:

```javascript
const notes = [
    {
        id: "1",
        text: "A note",
        children: [],
    },
    {
        id: "2",
        text: "Another note",
        children: [
            {
                id: "3",
                text: "A child note!",
            },
        ],
    },

];
```

## Example

You can find a complete example in the `docs` subdirectory of the code repository.


