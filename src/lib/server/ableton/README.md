# Server-side logic for communication between Ableton Live and clients (`$lib/server/ableton`)

This module is responsible for handling all communication with Ableton Live (TODO: explain submodules).

A subset of the Live application state is forwarded to the clients via the WebSocket server/connection. Some parts of the rather low-level `AbletonJS` 'objects' (e.g. `Track`) are translated into 'higher-level' objects that are easiert to work with in the client-side code. For example, the monitoring state for a track is translated into three possible values (`off`, `in`, `auto`) instead of the `AbletonJS` 'magic numbers' (`0`, `1`, `2`).


Clients can also send messages to the SvelteKit server via the WebSocket connection to interact with Live. Those messages are then translated into AbletonJS 'commands' which in turn forwards them to Live. Any resulting state changes are synchronized back to the clients.
