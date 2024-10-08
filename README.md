
[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](https://github.com/mariiio)

Outdated and original creator of this script: [mariiio / linkedin_connect](https://github.com/mariiio/linkedin_connect)

![enter image description here](https://i.imgur.com/bADxS4O.png)
# LinkedIn Connect

LinkedIn Connect is a configurable and easy to use JavaScript script to automate connections.

## Prerequisites

Make sure your _LinkedIn_ is in English

## Usage
1. Go to the _People_ section of the linkedin, like: (https://www.linkedin.com/search/results/people/?keywords=developer%20c%23&origin=GLOBAL_SEARCH_HEADER&sid=-Tq)
2. Modify the constants at the top of [linkedin_connect_2024.js](https://raw.githubusercontent.com/NotOnepiecePlease/linkedin_connect-JS-2024/refs/heads/main/linkedin_connect_2024.js) to your liking

| Constant| Description |
| --- | --- |
| `MAX_CONNECTIONS` | Maximum amount of connection requests |
| `WAIT_TO_CONNECT` | Time in ms to wait before requesting to connect |
| `WAIT_AFTER_SCROLL` | Time in ms to wait before new employees load after scroll |
| `POSITION_KEYWORDS` | Keywords to filter employees in specific positions |

3. Run it in the chrome dev tools [console](https://developers.google.com/web/tools/chrome-devtools/open#console) (or add it as a [snippet](https://developer.chrome.com/docs/devtools/javascript/snippets))

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Disclaimer
The code within this repository comes with no guarantee, the use of this code is your responsibility.
Use at your own risk.
