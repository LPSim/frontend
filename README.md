# GITCG-frontend

> Simple frontend for [zyr17/GITCG](https://github.com/zyr17/GITCG), or lpsim
> on PyPI.

## resorces downloading

We do not provide images here, you should collect them by your self before
using this project, otherwise images will not shown. Download `images.zip` from
[Baidu Netdisk](https://pan.baidu.com/s/1O1K2pdHSIsl2JY2p3UOVhw?pwd=tgic)
or 
[Google Drive](https://drive.google.com/drive/folders/12yKmNslSDwTCxoqOpuBD9fVzb_AYBWf1?usp=sharing),
unzip it and put the `images` folder in the
`static` folder. The author collected the images from network, and do not
guarantee the availability of the links. All copy right of images belongs to 
their original authors, and no commercial use is allowed.

## usage

### replay

run in development mode as Commands section.

Top left text box is used to put JSONL logs from zyr17/GITCG and show the data.
If `/log.txt` exists, it will automatically read it. Otherwise, input data
and click Parse.

When log is loaded, use prev \& next to show previous or next log data and
can set step count or jump to specific step. Switch between player 0 first or
player 1 first will decide who on top and who on bottom. By default, player 0
is on top. Current active player is marked with gold border. Click on any
elements will print its corresponding data in console.

# command-line interaction

To interact with GITCG, first open FastAPI server
on GITCG, then click refresh to receive current state. When requests is needed,
they will be shown on top-right. hover on a request will show the detail
of the request.
Text box in the middle is used to input command, type command and press enter
or click send to send command to server. If command is not valid or bug occurs,
error message may be shown in console, server-side output, or 
raise exception on server side. If command is valid, it will be sent to server,
update states, clear the command box, print all successfully sent command lists
in console. When receive state with any method from server, if the state is
different from the last state recoreded, it will append to the logs, and can
be checked by prev \& next.

You can paste multiple command lines or array of two command arrays for two
players in the command box, and click send to perform automatic interaction.
For detail of automatic interaction, please refer to codes in App.vue.

For the detail of commands, please refer to 
`agents/interaction_agent.py` in zyr17/GITCG.

### GUI interaction

To interact with GUI, first open FastAPI server on GITCG, then click refresh
to receive current state. When requests is needed, available requests and 
objects will be marked with gold border. To perform elemental tuning, skill,
or decleare round end, click corresponding buttons on right. To switch 
charactor, click charactor that want switch to. To use card, click card first,
then if this card need a target, click target. When an action need cost, the
code will automatically select the cost. You can manually select cost by 
clicking dice. When action, target and cost is selected, click confirm to send
command. If mistakenly selected, click cancel to cancel the selection. You can
also use space/enter to confirm and esc to cancel. 

When clicking on card, skill, charactor, summon, support, the detail 
information will be shown on the left, and also print in the console for its
structure. Hover on team status or charactor status will show its information
beside the icon.


![Sample](./docs/sample.png)

## Commands

You can replace `yarn` with `npm run` here.

```bash
# build for production
yarn build
yarn winbuild

# development mode
yarn dev
yarn windev

# run unit tests
yarn test

# serve the bundled dist folder in production mode
yarn serve
```
