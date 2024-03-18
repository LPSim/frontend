<template>
  <div id="app">
    <div class="header-div-container" :style="showDebug ? 'padding-bottom: 10vw' : ''">
      <div class="header-div" v-if="showDebug">
        <div class="interaction-div">
          <div style="height: 60%; padding: 5%;">
            <textarea v-model="interactionInput" @keydown.enter.prevent="sendInteraction" :disabled="processing || !this.displayInJudgeMode"></textarea>
          </div>
          <div class="interaction-button-group">
            <button @click="sendInteraction" :disabled="processing">{{ $t('Send') }}</button>
            <button @click="refreshData" :disabled="processing">{{ $t('Refresh') }}</button>
          </div>
        </div>
        <div class="requests-div">
          <ul v-if="match != null">
            <li v-for="(request, rid) in match.requests.filter(request => request.player_idx === currentRequestPlayerId)" :key="rid" @mouseover="showRequestDetails(request)" @mouseout="hideRequestDetails()" @click="logRequest(request)">
              {{ request.name.replace('Request', '') }}
            </li>
          </ul>
        </div>
        <div class="request-details">
          <RequestDetails :selectedRequest="selectedRequest" />
        </div>
        <div class="text-div">
          <h4>{{ $t('Upload replay file:') }}</h4>
          <input type="file" ref="fileInput" @change="handleFileSelect" :disabled="processing" style="font-size: 0.8vw">
        </div>
        <div class="server-refresh-div">
          <div class="server-url-div">
            <label for="server-url">{{ $t('Server URL:') }}</label>
            <input id="server-url" type="text" v-model="serverURL">
            <button id="connect-server-button" @click="connectServer" :disabled="playerTableOrder == -1" :style="serverConnected ? '' : 'background-color: #ffa500'">{{ $t(serverConnected ? 'Connected' : 'Connect') }}</button>
          </div>
          <div class="freq-div">
              <label :class="refreshInterval < 300 ? 'freq-label-warning' : ''" for="refresh-frequency">{{ $t('Auto Refresh frequency (ms):') }}</label>
              <input id="refresh-frequency" type="number" v-model="refreshInterval" min="1">
              <button :class="refreshTimeout ? '' : 'blink-refresh-button'" @click="refreshTimeout ? stopRefresh() : refreshData()" :disabled="!serverConnected || playerTableOrder == -1">{{ $t(refreshTimeout ? 'Stop Refresh' : 'Start Refresh') }}</button>
          </div>
        </div>
      </div>
      <div class="header-div" :style="showDebug ? 'top: 5vw;' : ''">
        <div class="refresh-debug-div">
          <button @click="changeLanguage()">Language</button>
          <button @click="showDebug = !showDebug">{{ $t('Toggle Debug') }}</button>
        </div>
        <div class="deck-start-div">
          <button id="check-show-deck" @click="clickCheckShowDeck" :disabled="playerTableOrder == -1 || !serverConnected">{{ $t('Check/Set Deck') }}</button>
          <button id="start-new-match" @click="clickStartNewMatch" :disabled="playerTableOrder == -1 || !serverConnected">{{ $t('Start New Match') }}</button>
        </div>
        <div class="radios-div">
          <p>{{ $t('Display Mode:') }}</p>
          <label>
            <input type="radio" v-model="displayInJudgeMode" :value="true" @click="updateMatch(undefined,true, null)">
            {{ $t('Judge Mode (show information of all players)') }}
          </label>
          <label>
            <input type="radio" v-model="displayInJudgeMode" :value="false" @click="updateMatch(undefined, false, null)">
            {{ $t('Play Mode (show information only current player)') }}
          </label>
        </div>
        <div class="order-div">
          <p :style="playerTableOrder == -1 ? 'color: red' : ''">{{ $t('View point:') }}</p>
          <!-- <div class="player-table-order" :style="playerTableOrder == -1 ? 'color: red' : ''"> -->
          <label v-for="tnum in [0, 1]">
            <input type="radio" v-model="playerTableOrder" :value="tnum" @click="updateMatch(undefined, null, tnum)">
            {{ $tc('Player :', tnum) }}{{ match ? match.player_tables[tnum].player_name : '' }}
          </label>
          <!-- </div> -->
        </div>
        <div class="main-info-div">
          <div v-if="playerTableOrder == -1">
            <div class="round-div" style="font-weight: bold; font-size: 2vw;">
              {{ $t('Please select view point.') }}
            </div>
          </div>
          <div v-if="playerTableOrder != -1 && !serverConnected">
            <div class="round-div" style="font-weight: bold; font-size: 1.5vw;">
              {{ $t('Please connect server.') }}
            </div>
          </div>
          <div v-if="match == null && playerTableOrder != -1 && serverConnected">
            <div class="round-div" style="font-weight: bold; font-size: 1.5vw;">
              {{ $t('No Match Data.') }}<br>{{ $t('Refresh or load replay in debug.') }}
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1">
            <div class="match-state-div">
              {{ $t('Current Match State: ') }}{{ $t('MATCHSTATE/' + match.state) }}
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1 && serverConnected" style="font-size: 1vw">
            <div class="your-turn-div" v-if="isYourTurn" style="font-weight: bold;">
              {{ $t('Current is Your Turn') }}
            </div>
            <div class="your-turn-div" v-else>
              {{ $t('Current is Not Your Turn') }}
            </div>
          </div>
          <div v-if="match != null && playerTableOrder != -1">
            <div class="round-div" style="font-weight: bold; font-size: 2vw;">
              {{ $tc('Round ', match.round_number) }}
            </div>
          </div>
        </div>
        <div class="buttons-div">
          <div class="data-navigation">
            <div class="data-navigation-first">
              <div class="step-count">
                <label for="step-count-input">{{ $t('Step count:') }}</label>
                <input id="step-count-input" type="number" v-model="stepCount" min="1" max="1000">
              </div>
              <button @click="showPrevData" :disabled="currentDataIndex === 0 || matchData.length === 0">{{ $t('Prev') }}</button>
              <button @click="showNextData" :disabled="currentDataIndex === matchData.length - 1 || matchData.length === 0">{{ $t('Next') }}</button>
            </div>
            <div class="data-navigation-second">
              <div class="current-step">
                <label for="current-step-input">{{ $t('Current step:') }}</label>
                <input id="current-step-input" type="number" v-model="currentDataIndex" @keydown.enter="jumpToData" min="0" :max="matchData.length - 1">
              </div>
              <button @click="jumpToData" :disabled="matchData.length === 0">{{ $t('Jump') }}</button>
              <button @click="jumpToEndData" :disabled="(!matchData) || (matchData.length === 0) || (currentDataIndex == matchData.length - 1)" style="background-color: #ffa500">{{ $t('Jump to End') }}</button>
            </div>
          </div>
        </div>
        <div class="debug-refresh-freq-div">
          <div class="animation-freq-div">
              <label for="animation-frequency">{{ $t('Animation frequency (ms):') }}</label>
              <input id="animation-frequency" type="number" v-model="animationInterval" min="1">
          </div>
          <div class="reset-refresh-div">
              <button class="reset-button" @click="resetByIndex()" :disabled="playerTableOrder == -1 || matchData.length === 0 || !serverConnected">{{ $t('Reset Match to This Index') }}</button>
              <span :class="refreshTimeout ? '' : 'blink-refresh-span'">{{  $t(refreshTimeout ? 'Auto refreshing' : 'Refresh stopped') }}</span>
              <button :class="refreshTimeout ? '' : 'blink-refresh-button'" @click="refreshTimeout ? stopRefresh() : refreshData()" :disabled="!serverConnected || playerTableOrder == -1">{{ $t(refreshTimeout ? 'Stop Refresh' : 'Start Refresh') }}</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeckDiv" class="deck-container">
      <div class="desc-container">
        <DescBlock v-for="(desc, did) in descData" :key="did" :desc="desc" :version="descData[0].version" :show_version="did == 0" />
      </div>
      <div class="deck-container-inner">
        <Deck :player-idx="1 - playerTableOrder" :card-modifiable="displayInJudgeMode"></Deck>
        <Deck :player-idx="playerTableOrder" :card-modifiable="true"></Deck>
      </div>
    </div>
    <div class="match-container" v-if="match != null && !showDeckDiv">
      <div class="desc-container">
        <DescBlock v-for="(desc, did) in descData" :key="did" :desc="desc" :version="descData[0].version" :show_version="did == 0" />
      </div>
      <div v-if="predictMatch" class="player-tables-container prediction-container">
        <div class="player-tables" v-for="(playerTable, pid) in sortedPredictPlayerTables" :key="pid" :style="'top: ' + (pid == 1 ? '50%' : '0')">
          <PlayerTable :class="{'table-current-player': match.current_player == playerTable.player_idx, 'table-current-request': currentRespondingPlayerId == playerTable.player_idx}" :playerTable="playerTable" :is_reverse="pid == 0"/>
        </div>
      </div>
      <div v-else class="player-tables-container">
        <div class="player-tables" v-for="(playerTable, pid) in sortedPlayerTables" :key="pid" :style="'top: ' + (pid == 1 ? '50%' : '0')">
          <PlayerTable :class="{'table-current-player': match.current_player == playerTable.player_idx, 'table-current-request': currentRespondingPlayerId == playerTable.player_idx}" :playerTable="playerTable" :is_reverse="pid == 0"/>
        </div>
      </div>
      <div v-if="switchNotify" :class="{ 'switch-notify-container': true, 'notify-right-part': switchNotify.player_id != playerTableOrder }">
        <div :class="{ 'opponent-shadow-color': switchNotify.player_id != playerTableOrder }">
          <img :src="$store.getters.getImagePath({ type: 'AVATAR', name: switchNotify.character_name, desc: switchNotify.character_desc })" @load="updateImageWidth($event)" @error="$event.target.style.display='none'"/>
          <div>
            <p>{{ $t('Switch to') }} {{ $t('CHARACTER/' + $store.getters.getNameWithDesc({ name: switchNotify.character_name, desc: switchNotify.character_desc })) }}</p>
          </div>
        </div>
      </div>
      <div v-if="skillNotify" :class="{ 'skill-notify-container': true, 'notify-right-part': skillNotify.player_id != playerTableOrder }">
        <div :class="{ 'opponent-shadow-color': skillNotify.player_id != playerTableOrder }">
          <img :src="$store.getters.getImagePath({ type: 'AVATAR', name: skillNotify.character_name, desc: skillNotify.character_desc })" @load="updateImageWidth($event)" @error="$event.target.style.display='none'"/>
          <div>
            <p>{{ $t('CHARACTER/' + $store.getters.getNameWithDesc({ name: skillNotify.character_name, desc: skillNotify.character_desc })) }} {{ $t('used') }} {{ $t('SKILL_TYPE/' + skillNotify.skill_type) }}</p>
            <p>{{ $t('SKILL_' + skillNotify.character_name + '_' + skillNotify.skill_type + '/' + skillNotify.skill_name) }}</p>
          </div>
        </div>
      </div>
      <div v-if="cardNotify" :class="{ 'card-notify-container': true, 'notify-right-part': cardNotify.player_id != playerTableOrder }">
        <img :src="$store.getters.getImagePath(cardNotify)" :class="{ 'opponent-shadow-color': cardNotify.player_id != playerTableOrder }" @error="imgSrcError($event)"/>
        <div class="card-notify-text">
          <span>{{ imageAlt(cardNotify) }}</span>
        </div>
      </div>
      <div v-if="roundEndNotify" :class="{ 'center-text-notify-container': true, 'opponent-shadow-color': roundEndNotify.player_id != playerTableOrder }">
        <span>{{ $t((roundEndNotify.player_id != playerTableOrder ? 'Opponent' : 'You') + ' declare round end', ) }}</span>
      </div>
      <div v-if="waitOpponentNotify" :class="{ 'center-text-notify-container': true, 'opponent-shadow-color': true }">
        <span style="font-size: 1.25vw">{{ $t('Waiting for opponent action. Current state is initial state, state will update until both players have done actions.') }}</span>
      </div>
      <div v-if="match.state == 'STARTING_CARD_SWITCH'" :class="{ 'center-text-notify-container': true, 'opponent-shadow-color': !isYourTurn }">
        <span>{{ $t((isYourTurn ? 'You' : 'Opponent') + ' goes first. Choose cards to switch.') }}</span>
      </div>
      <div v-if="match.state == 'ENDED'" :class="{ 'center-text-notify-container': true, 'opponent-shadow-color': match.winner != playerTableOrder }">
        <span>{{ match.winner == -1 ? $t('Maximum round exceeded, dual loss') : ($t('Game End') + $t((match.winner != playerTableOrder ? 'Opponent' : 'You') + ' win', )) }}</span>
      </div>
      <div v-if="predictFullMatch" class="prediction-notify-container">
        <div v-for="number in 15">
          <span>{{ $t('Skill Prediction') }}</span>
        </div>
      </div>
      <div class="requests-button-container">
        <div class="prev-buttons">
          <div v-for="data, key in prevButtonRequests" :key="key" @click="selectRequest(data)" >
            <RequestButton :title="data.title" :cost="data.cost" :select_class="selectClass(data.title, data.idx)" />
          </div>
        </div>
        <div class="last-buttons">
          <div v-if="buttonRequests.SwitchCharacter" @click="selectRequest(buttonRequests.SwitchCharacter)">
            <RequestButton :title="buttonRequests.SwitchCharacter.title" :cost="buttonRequests.SwitchCharacter.cost" :select_class="selectClass('Switch Character', buttonRequests.SwitchCharacter.idx)" />
          </div>
          <div v-if="!buttonRequests.SwitchCharacter && buttonRequests.DeclareRoundEnd" @click="selectRequest(buttonRequests.DeclareRoundEnd)">
            <RequestButton :title="$t('Declare Round End')" :select_class="selectClass('Declare Round End', buttonRequests.DeclareRoundEnd.idx)" />
          </div>
          <div @click="confirmSelection">
            <RequestButton :title="$t('Confirm') + '<br>' + $t('(Space key)')" :select_class="selectClass('Confirm')" />
          </div>
          <div @click="cancelSelection">
            <RequestButton :title="$t('Cancel') + '<br>' + $t('(ESC key)')" :select_class="selectClass('Cancel')" />
          </div>
        </div>
      </div>
    </div>
    <div class="empty-container" v-if="match == null && !showDeckDiv">
    </div>
    <div id="overlay" v-if="showOverlay && !serverConnected">
      <div id="overlay-content" style="background-color: white; padding: 20px;">
        <h2>{{ $t('LPSim frontend') }}</h2>
        <div class="overlay-content-div">
          <label for="server-url-overlay">{{ $t('Server URL:') }}</label>
          <input id="server-url-overlay" type="text" v-model="roomServerURL">
        </div>
        <div class="overlay-content-div">
          <label for="room-name-overlay">{{ $t('Room name:') }}</label>
          <input id="room-name-overlay" type="text" v-model="roomName">
        </div>
        <div class="player-table-order">
          <p>{{ $t('View point:') }}</p>
          <label v-for="tnum in [0, 1]">
            <input type="radio" v-model="playerTableOrder" :value="tnum">
            {{ $tc('Player', tnum) }}{{ match ? match.player_tables[tnum].player_name : '' }}
          </label>
        </div>
        <div class="overlay-button-div">
          <button @click="overlayConnectServer" :disabled="playerTableOrder == -1">{{  $t('Connect') }}</button>
          <button @click="changeLanguage()">Language</button>
        </div>
        <div class="overlay-desc-div">
          <h3>{{ $t('Note') }}</h3>
          <p><strong class="important-strong">{{ $t('Frontend cannot run independently') }}</strong>{{ $t('Frontend cannot run independently description') }}</p>
          <p><strong>{{ $t('Server URL:') }}</strong>{{ $t('Server URL Hint') }}</p>
          <p><strong>{{ $t('Room name:') }}</strong>{{ $t('Room Name Hint') }}</p>
          <div class="room-name-desc">
            <p><strong>{{ $t('Room Server title') }}</strong>{{ $t('Room Server description') }}</p>
            <p><strong>{{ $t('Match Server title') }}</strong>{{ $t('Match Server description') }}</p>
          </div>
          <p><strong>{{ $t('View point:') }}</strong>{{ $t('View point Hint') }}</p>
          <p><strong class="important-strong">{{ $t('No Image Title') }}</strong>{{ $t('No Image Title description') }}</p>
        </div>
        <div class="overlay-content-div">
          <input id="room-name-overlay" type="text" v-model="imageResourceURL">
        </div>
        <div id="footer">
          <h5>{{ $t('Disclaimer') }}</h5>
          <p id="disclaimer">{{  $t('Disclaimer description') }}</p>
          <h5>{{ $t('Links') }}</h5>
          <a href="https://github.com/LPSim/backend">{{  $t('Backend GitHub Link') }}</a>
          <a href="https://github.com/LPSim/frontend">{{  $t('Frontend GitHub Link') }}</a>
          <a href="https://www.bilibili.com/video/BV1ay4y1w7qU/">{{  $t('Bilibili') }}</a>
          <a href="https://beian.miit.gov.cn/" v-if="isSelfPage">浙ICP备17027553号-1</a>
        </div>
      </div>
    </div>
    <notifications :position="showOverlay || showDeckDiv ? 'top center' : 'bottom right'" :duration="3000" width="20%" :ignoreDuplicates="true"/>
  </div>
</template>

<script>
// to disable existing service workers
try {
  navigator.serviceWorker.getRegistrations().then( function(registrations) { for(let registration of registrations) { registration.unregister(); } });
}
catch (err) {

}

import PlayerTable from './PlayerTable.vue'
import RequestDetails from './RequestDetails.vue';
import RequestButton from './RequestButton.vue';
import Deck from './Deck.vue';
import DescBlock from './DescBlock.vue';
import HTTP from '../http';
import packageJSON from '../../package.json';

export default {
  name: 'App',
  components: {
    PlayerTable,
    RequestDetails,
    RequestButton,
    Deck,
    DescBlock
  },
  data() {
    return {
      dataVersion: null,
      matchDataInput: 'Loading...',
      matchData: [],
      requestData: [],
      currentDataIndex: 0,
      maxPlayedDataIndex: 0,
      fullMatch: null,
      predictFullMatch: null,
      playerTableOrder: -1,
      stepCount: 1,
      processing: false,
      selectedRequest: null,
      commandPOSTData: null,
      interactionInput: '',
      interactionCommands: [[], []],
      commandHistory: [[], []],
      multiCommandTimeout: 100,
      refreshInterval: 1000,
      showDebug: false,
      displayInJudgeMode: false,
      refreshTimeout: null,
      matchUUID: null,
      showOverlay: true,
    }
  },
  created() {
    this.$store.commit('readFromLocalStorage');
    // set language to update title

    // log data when created
    console.log('APP', this);
    console.log('STORE', this.$store.state);
    // console.log('I18N', this.$root.$i18n, this.$i18n);

    // set current language
    this.$root.$i18n.locale = this.currentLanguage;
    this.currentLanguage = this.currentLanguage;

    // auto load logs.txt. when debug, it avoids manually loading data.
    // const logFilePath = 'logs.txt';
    // const xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = () => {
    //   if (xhr.readyState === 4) {
    //     this.processing = false;
    //     this.matchDataInput = '';
    //     if (xhr.status === 200) {
    //       this.matchDataInput = xhr.responseText;
    //       this.parseLogFileData();
    //     }
    //   }
    // };
    // xhr.open('GET', logFilePath, true);
    // xhr.send();
    // this.processing = true;
    // this.playerTableOrder = 1;
    // this.displayInJudgeMode = true;
    // this.showDebug = true;
    // this.refreshInterval = 100;
    // this.refreshData();

    // listen to ESC and ENTER key
    window.removeEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    sendNotify(data) {
      // send notify with unlimited time when in backend
      if (document.hidden) {
        data.duration = -1;
        data.title = this.$t('Background message, click to hide')
      }
      this.$notify(data);
    },
    getFailFunc(msg, stopServerConnection = false) {
      function failFunc(err) {
        this.make_alert(this.$t(msg) + err, err);
        if (stopServerConnection) this.stopServerByError();
      }
      return failFunc.bind(this);
    },
    getCheckFunc(err_msg, stopServerConnection = true) {
      function notOK(response) {
        // receive response from fetch, return message json if ok, else throw
        // error.
        if (!response.ok) {
          response.json().then(data => {
            throw new Error(this.$t('Network response is not ok with detail ') + JSON.stringify(data.detail));
          })
          .catch(error => {
            this.make_alert(this.$t(err_msg) + error.message, error)
            if (stopServerConnection) this.stopServerByError();
          });
        }
        else return response.json();
      }
      return notOK.bind(this);
    },
    connectServer() {
      this.wrongProtocol();
      if (this.serverConnected) {
        if (!this.refreshTimeout) this.refreshTimeout = setTimeout(() => this.refreshData(), 0);
        return;
      }
      // try to connect server. will first check version, and send callback
      // that will request patch data.

      function patchSuccess(patch_message) {
        // let patch_message = JSON.parse(xhr.responseText);
        console.log('PATCH', patch_message, Object.keys(patch_message.patch).length, 'KEYS');
        this.updateLocales(patch_message);
        this.$store.commit('updateDataByPatch', patch_message);
        this.sendNotify({
          text: this.$t('Connected to server.'),
          type: 'success'
        });
        this.serverConnected = true;
        // when successfully connected, start auto refreshing immediately.
        this.refreshTimeout = setTimeout(() => this.refreshData(), 0);
      }
      function deckCodeSuccess(deck_code_data) {
        console.log('DECK CODE DATA', deck_code_data);
        this.$store.commit('setDeckCodeData', deck_code_data);
      }

      let err_msg = 'Error in connecting server. ';
      function connectedCallback() {
        this.showOverlay = false;
        HTTP.getPatch(
          this.serverURL,
          patchSuccess.bind(this),
          this.getCheckFunc(err_msg).bind(this),
          this.getFailFunc(err_msg).bind(this)
        );
        HTTP.getDeckCodeData(
          this.serverURL,
          deckCodeSuccess.bind(this),
          this.getCheckFunc(err_msg).bind(this),
          this.getFailFunc(err_msg).bind(this)
        );
      }
      this.checkVersion(this.serverURL, connectedCallback.bind(this));
    },
    checkRoomName(){
      if (this.roomName == '') return true;
      if (this.roomName.length < 4 || this.roomName.length > 12) return false;
      for (let char of this.roomName) {
        if (char < '0' || char > '9')
          if (char < 'a' || char > 'z')
            if (char < 'A' || char > 'Z')
              if (char != '_') return false;
      }
      return true;
    },
    overlayConnectServer() {
      // before old connect server, this will check room name, and
      // update room name if it is valid.
      if (!this.checkRoomName()) {
        this.sendNotify({
          text: this.$t('Room name must be 4-12 characters, only contains alphabets, numbers or underscore(_).'),
          type: 'error'
        });
        return;
      }
      function postRoomNameSuccess(data) {
        let port = data.port;
        let status = data.status;
        console.log(port, status);
        if (status == 'failed') {
          this.sendNotify({
            text: this.$t('Create room failed. Please check backend output.'),
            type: 'error'
          });
          return;
        }
        if (status == 'full') {
          this.sendNotify({
            text: this.$t('Room is full. Please try to create new room later or enter existing rooms.'),
            type: 'error'
          });
          return;
        }
        if (status == 'exist') {
          this.sendNotify({
            text: this.$t('Successfully enter room ') + this.roomName,
            type: 'success'
          });
        }
        if (status == 'created') {
          this.sendNotify({
            text: this.$t('Successfully create room ') + this.roomName,
            type: 'success'
          });
        }
        let url = new URL(this.roomServerURL);
        url.port = port;
        let serverURL = url.toString();
        while (serverURL.endsWith('/')) serverURL = serverURL.slice(0, -1);
        this.serverURL = serverURL;
        HTTP.updateRoomName(this.roomName);
        localStorage.setItem('roomName', this.roomName);
        this.showOverlay = false;
        this.connectServer();
      }
      function checkVersionCallback(obj) {
        // check server type is right
        let target_class = 'HTTPServer';
        if (obj.info) {
          // if contains info, get target class name
          target_class = obj.info.class;
        }
        if (target_class == 'HTTPRoomServer' && this.roomName == '') {
          // if is room server, but room name is empty, raise alert.
          let msg = this.$t('Server is room server, but room name is empty. Please input room name.');
          this.sendNotify({
            text: msg,
            type: 'error'
          });
          return;
        }
        else if (target_class == 'HTTPServer' && this.roomName != '') {
          // if is match server, but room name is not empty, raise alert.
          let msg = this.$t('Server is match server, but room name is not empty. Please clear room name.');
          this.sendNotify({
            text: msg,
            type: 'error'
          });
          return;
        }
        if (!obj.info || obj.info.class == 'HTTPServer') {
          // is match server, no need to post room name.
          this.serverURL = this.roomServerURL;
          this.connectServer();
        }
        else {
          // is room server, need to post room name.
          let err_msg = 'Error in posting room name. ';
          HTTP.postRoomName(
            this.roomServerURL,
            this.roomName,
            postRoomNameSuccess.bind(this),
            this.getCheckFunc(err_msg).bind(this),
            this.getFailFunc(err_msg).bind(this)
          );
        }
      }
      console.log(this.roomServerURL, this.serverURL);
      this.checkVersion(this.roomServerURL, checkVersionCallback.bind(this));
    },
    stopServerByError() {
      // error occured, stop auto refresh.
      // Make confirmation that whether user want to clear all data.
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
      if (confirm(this.$t('Stop server connection by error, clear all data?'))) {
        this.clearAllData(false);
        this.connectServer();
      }
    },
    clearAllData(make_alert = true) {
        document.activeElement.blur();
        this.$store.commit('setShowDeckDiv', false);
        clearTimeout(this.refreshTimeout);
        this.matchData = [];
        this.fullMatch = null;
        this.predictFullMatch = null;
        this.currentDataIndex = 0;
        this.maxPlayedDataIndex = 0;
        this.interactionCommands = [[], []];
        this.commandHistory = [[], []];
        this.requestData = [];
        this.processing = false;
        this.matchUUID = null;
        if (make_alert) this.sendNotify({
          text: this.$t('Game reset successfully!'),
          type: 'success'
        });
    },
    checkVersion(serverURL, callback = undefined) {
      function versionSuccess(obj) {
        let support_version = obj.support_version;
        let version = obj.version;
        console.log('SERVER VERSION', version);
        console.log('SUPPORT VERSION', support_version);
        let self_version = packageJSON.version;
        if (!(support_version == undefined || support_version == 'unknown')) {
          // undefined, old server, no error message.
          // or unknown, debug server, no error message.
          if (support_version != self_version) {
            let msg = (
              this.$t('Server version is ') + version +
              this.$t(', supported frontend version is ') + support_version +
              this.$t(', but client version is ') + self_version +
              this.$t('. Client may not work properly.')
            );
            this.sendNotify({
              text: msg,
              type: 'warn'
            });
          }
        }
        if (callback) callback(obj);
      }
      let err_msg = 'Error in checking server version. ';
      HTTP.getVersion(
        serverURL,
        versionSuccess.bind(this),
        this.getCheckFunc(err_msg).bind(this),
        this.getFailFunc(err_msg).bind(this)
      );
    },
    updateLocales(patch) {
      let version = patch.version;
      if (version != '1.0') throw new Error('Unknown patch version ' + version);
      patch = patch.patch;
      let new_messages = {};
      for (let full_key in patch) {
        let data = patch[full_key];
        if (data.names) {
          for (let lang in data.names) {
            if (!new_messages[lang]) new_messages[lang] = {};
            let name = data.names[lang];
            if (name[0] == '$') {
              // is reference
              let ref_key = name.slice(1);
              name = this.$i18n.messages[lang][ref_key];
            }
            new_messages[lang][full_key] = name;
          }
        }
        if (data.descs) {
          for (let version in data.descs) {
            for (let lang in data.descs[version]) {
              if (!new_messages[lang]) new_messages[lang] = {};
              let desc = data.descs[version][lang];
              if (desc[0] == '$') {
                // is reference
                let ref_key = desc.slice(1);
                desc = this.$i18n.messages[lang][ref_key];
              }
              new_messages[lang][full_key + '/' + version] = desc
            }
          }
        }
      }
      console.log('NEW MESSAGES', new_messages);
      for (let lang in new_messages)
        this.$i18n.mergeLocaleMessage(lang, new_messages[lang]);
    },
    wrongProtocol() {
      // when from lpsim.zyr17.cn, use http to connect localhost, or use https
      // to connect LAN server, the protocol is wrong.
      // if protocol wrong, give alert and raise error.
      let url = document.URL;
      if (!url.includes('lpsim.zyr17.cn')) return;
      let current_protocol = window.location.protocol;
      let target = this.serverURL;
      let target_protocol = target.split(':')[0].trim().toLowerCase();
      if (target_protocol == 'https') {
        // target is https, current must https
        if (current_protocol != 'https:') {
          let msg = this.$t('To connect https server, visit https://lpsim.zyr17.cn. Currently you are visiting http page.');
          this.make_alert(msg, msg);
          throw new Error(msg);
        }
        return;
      }
      if (target.includes('localhost') || target.includes('127.0.0.1')) {
        if (current_protocol == 'https:') return;
        let msg = this.$t('To connect localhost server, visit https://lpsim.zyr17.cn. Currently you are visiting http page.');
        this.make_alert(msg, msg);
        throw new Error(msg);
      }
      else {
        if (current_protocol == 'http:') return;
        let msg = this.$t('To connect LAN server, visit http://lpsim.zyr17.cn. Currently you are visiting https page.');
        this.make_alert(msg, msg);
        throw new Error(msg);
      }
    },
    changeLanguage(lang = null) {
      if (lang == null) {
        // select next language
        let keys = Object.keys(this.$i18n.messages).sort();
        let position = keys.indexOf(this.currentLanguage);
        this.$root.$i18n.locale = keys[(position + 1) % keys.length];
        this.currentLanguage = keys[(position + 1) % keys.length];
        console.log('Change language to ' + this.currentLanguage);
      }
    },
    make_alert(title, data) {
      console.error(data);
      this.sendNotify({
        text: title + this.$t('\nFind detail in console.'),
        type: 'error'
      });
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    },
    handleFileSelect() {
      const file = this.$refs.fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.matchDataInput = reader.result;
        this.parseLogFileData();
      };
      reader.readAsText(file);
    },
    logRequest(request) {
      console.log('REQUEST', JSON.parse(JSON.stringify(request)));
    },
    handleKeyDown(event) {
      let prevent_target = (
        (event.target.tagName == 'INPUT' && event.target.type !== 'radio')
        || event.target.tagName == 'TEXTAREA'
      );
      if (event.keyCode === 27) { // ESC key
        if (!prevent_target) {
          // Perform the desired action for the ESC key
          this.cancelSelection();
        }
      } else if (event.keyCode === 13 || event.keyCode == 32) { // ENTER or SPACE key
        if (!prevent_target) {
          // Perform the desired action for the ENTER key
          this.confirmSelection();
        }
      }
    },
    updateMatch(data, mode = null, player_idx = null) {
      if (data === undefined) data = this.matchData[this.currentDataIndex];
      if (data === undefined) return;
      data = JSON.parse(JSON.stringify(data))
      data.player_tables[0].player_idx = 0
      data.player_tables[1].player_idx = 1
      let requests = data.requests
      // console.log(data, requests, this.currentDataIndex, this.matchData.length - 1)
      if (this.currentDataIndex == this.matchData.length - 1) {
        // in last, parse requests from requestData
        requests = JSON.parse(JSON.stringify(this.requestData))
      }
      for (let i = 0; i < requests.length; i++) {
        let request = requests[i]
        if (request.name == 'UseCardRequest') {
          let player_idx = request.player_idx
          let card_idx = request.card_idx
          let hands = data.player_tables[player_idx].hands
          let card = hands[card_idx]
          if (card) card.cost = request.cost
          else console.error('UseCardRequest, but card not exist', request, hands)
          // console.log(request.name, request, request.cost)
        }
        else if (request.name == 'UseSkillRequest') {
          // console.log(request.name, request.cost)
        }
        else if (request.name == 'SwitchCharacterRequest') {
          // console.log(request.name, request.cost)
        }
        else if (request.name == 'RerollDiceRequest') {
          // if is reroll-dice request, update dice color from request
          let player_idx = request.player_idx
          let colors = request.colors
          data.player_tables[player_idx].dice.colors = colors
        }
        else {
          // console.log(request.name)
        }
      }
      this.fullMatch = data
      this.fullMatch.requests = requests
      let match = this.fullMatch
      // console.log(match.last_action.type)

      // set damage info
      let damage_info = null;
      if (match.last_action.type == 'MAKE_DAMAGE') {
        // console.log(JSON.parse(JSON.stringify(match.last_action)))
        // console.log(JSON.parse(JSON.stringify(match.action_info)))
        damage_info = match.action_info;
        damage_info.position = match.last_action.damage_value_list[0].position;
      }
      this.$store.commit('setDamageNotify', damage_info)

      // update deck in it has deck information
      // let deck = [];
      // for (let i = 0; i < match.player_tables; i ++ )
      //   if (match.player_tables[i].deck)
      //     deck.push(match.player_tables[i].deck);
      // if (deck.length == 0) deck = null;
      // this.$store.commit('setDeck', deck);
      this.commitMatchToStore(mode, player_idx)
    },
    commitMatchToStore(mode = null, player_idx = null) {
      if (player_idx == null) player_idx = this.playerTableOrder;
      if (mode == null) mode = this.displayInJudgeMode;
      if (mode) player_idx = null;
      this.predictFullMatch = null;
      this.$store.commit('setMatch', {
        match: this.fullMatch,
        player_idx: player_idx,
      })
    },
    parseLogFileData() {
      // Parse the character data and update the match object
      let data = this.matchDataInput.trim().split('\n').map(line => JSON.parse(line))
      this.dataVersion = data[0].version
      if (data[0].name == 'Main')
        this.matchData = data.map(d => d.match)
      else this.matchData = data
      this.updateMatch(this.matchData[0])
      this.currentDataIndex = 0
      this.matchDataInput = ''
    },
    showPrevData() {
      let stepCount = parseInt(this.stepCount)
      this.currentDataIndex = Math.max(0, this.currentDataIndex - stepCount);
      this.jumpToData()
    },
    showNextData() {
      let stepCount = parseInt(this.stepCount)
      this.currentDataIndex = Math.min(this.matchData.length - 1, this.currentDataIndex + stepCount);
      if (this.currentDataIndex > this.maxPlayedDataIndex)
        this.maxPlayedDataIndex = this.currentDataIndex;
      this.jumpToData()
    },
    jumpToData() {
      this.currentDataIndex = Math.min(this.matchData.length - 1, Math.max(0, this.currentDataIndex))
      this.updateMatch(this.matchData[this.currentDataIndex])
    },
    jumpToEndData() {
      this.currentDataIndex = this.matchData.length - 1;
      this.maxPlayedDataIndex = this.currentDataIndex;
      this.updateMatch(this.matchData[this.currentDataIndex])
    },
    sendInteraction() {
      let input = this.interactionInput.trim();
      if (input.length == 0) return;
      try {
        input = JSON.parse(input);
        if (Array.isArray(input) && input.length == 2) {
          this.interactionCommands = input;
          if (this.interactionCommands[this.currentRequestPlayerId].length > 1)
            this.processing = true;
          this.realSendInteraction();
          return;
        }
      }
      catch (e) {}
      this.interactionCommands[this.currentRequestPlayerId] = input.split('\n');
      if (this.interactionCommands[this.currentRequestPlayerId].length > 1)
        this.processing = true;
      this.realSendInteraction();
    },
    realSendInteraction() {
      let cid = this.currentRequestPlayerId;
      if (cid == null) {
        // no need response now. maybe network problem, re-run this function
        // later.
        setTimeout(() => this.realSendInteraction(), this.multiCommandTimeout);
        return;
      }
      let test_appear = false;
      while (this.interactionCommands[cid].length > 0 && this.interactionCommands[cid][0].slice(0, 4) == 'TEST') {
        // skip TEST commands, only save them in history.
        this.commandHistory[cid].push(this.interactionCommands[cid][0]);
        this.interactionCommands[cid] = this.interactionCommands[cid].slice(1);
        test_appear = true;
      }
      if (this.interactionCommands[cid].length == 0) {
        this.processing = false;
        if (test_appear) this.interactionInput = '';
        return;
      }
      const data = {
        player_idx: this.currentRequestPlayerId,
        command: this.interactionCommands[cid][0],
        frame_number: this.currentDataIndex,
      };
      if (this.matchUUID) data.uuid = this.matchUUID;
      console.log(data)
      this.commandPOSTData = data;
      this.interactionCommands[cid] = this.interactionCommands[cid].slice(1);
      if (this.refreshTimeout != null) {
        clearTimeout(this.refreshTimeout);
      }
      function postSuccess(data) {
        if (!data) return; // error on previous or empty data, no need to update
        console.log('Received Data', data);
        this.commandHistory[this.commandPOSTData.player_idx].push(this.commandPOSTData.command);
        this.interactionInput = '';
        console.log('HISTORY', this.commandHistory);
        if (data.length == 0) {
          // send response successfully, but no updated data. update request data.
          this.updateRequestData();
        }
        this.updateMatchData(data, this.animationInterval);
        if (this.match.requests.length > 0)
          this.selectedRequest = this.match.requests[0];
        setTimeout(() => this.realSendInteraction(), this.multiCommandTimeout);
      }
      let err_msg = 'Error in sending response. If this error occurs frequently, please try refreshing the page. Detail: ';
      HTTP.postRespond(
        this.serverURL,
        data,
        postSuccess.bind(this),
        this.getCheckFunc(err_msg, false),
        this.getFailFunc(err_msg).bind(this)
      );
      return;
    },
    decodeDiffMatchData(data) {
      let res = [];
      if (data.length == 0) return res;
      for (let i = 0; i < data.length; i ++ ) {
        if (data[i].idx < this.matchData.length) {
          // idx is smaller than current data, ignore
          continue;
        }
        if (data[i].type == 'FULL') {
          res.push(data[i]);
        }
        else {
          // type is diff
          let diffs = data[i].match_diff;
          let recover_match;
          if (i > 0)
            recover_match = JSON.parse(JSON.stringify(data[i - 1].match));
          else {
            // first is diff, get full from matchData
            if (data[i].idx != this.matchData.length) {
              this.make_alert(
                this.$t('Error in update match data. ') + data[i].idx
                + this.$tc(' is not equal to current match length ', this.matchData.length),
              data);
            }
            recover_match = JSON.parse(JSON.stringify(this.matchData[this.matchData.length - 1]));
          }
          for (let i = 0; i < diffs.length; i ++ ) {
            let diff = diffs[i];
            let key = diff[1];
            if (typeof key === 'string') key = key.split('.');
            let target = recover_match;
            // leave last key for later use
            for (let k = 0; k < key.length - 1; k ++ ) target = target[key[k]];
            key = key[key.length - 1];

            if (diff[0] == 'change') {
              target[key] = diff[2][1];
            }
            else if (diff[0] == 'add') {
              for (let r of diff[2]) {
                let rkey = r[0];
                target[key][rkey] = r[1];
              }
            }
            else if (diff[0] == 'remove') {
              for (let r of diff[2]) {
                let rkey = r[0];
                delete target[key][rkey];
                if (Array.isArray(target[key])) {
                  // for array, after remove, should delete undefined and null
                  while (target[key].length
                         && (target[key][target[key].length - 1] === undefined
                             || target[key][target[key].length - 1] === null))
                    target[key].pop();
                }
              }
            }
          }
          // var _ = require('lodash');
          // if (!_.isEqual(recover_match, data[i].match)) {
          //   console.log(data[i].match_diff);
          //   console.error('different', recover_match == data[i].match,
          //                 Object.is(recover_match, data[i].match),
          //                 _.isEqual(recover_match, data[i].match),
          //                 recover_match, data[i].match);
          // }
          data[i].match = recover_match;
          res.push(data[i]);
        }
      }
      return res;
    },
    UUIDDifferent(uuid) {
      this.matchUUID = uuid;
      if (this.refreshTimeout != null) {
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = null;
      }
      let clean = confirm(this.$t('UUID not match! refresh stopped. Clear all data and continue refreshing?'));
      if (clean) {
        this.clearAllData(false);
        this.refreshData();
      }
    },
    updateMatchData(data, refresh = 0) {
      if (refresh) {
        if (this.refreshTimeout != null) {
          clearTimeout(this.refreshTimeout);
          this.refreshTimeout = null;
        }
        this.refreshTimeout = setTimeout(() => this.refreshData(), refresh);
      }
      if (data.length == 0) {
        if (this.matchData.length > this.maxPlayedDataIndex + 1) {
          this.maxPlayedDataIndex += 1;
          this.currentDataIndex = this.maxPlayedDataIndex;
          this.updateMatch(this.matchData[this.currentDataIndex]);
        }
        return;
      }
      let uuid = data[0].uuid;
      if (this.matchUUID && uuid && uuid != this.matchUUID) {
        this.UUIDDifferent(uuid);
        return;
      }
      this.matchUUID = uuid;
      data = this.decodeDiffMatchData(data);
      for (let i = 0; i < data.length; i ++ ) {
        let d = data[i];
        let idx = d.idx;
        let match = d.match;
        if (idx == this.matchData.length) {
          this.matchData.push(match);
          this.requestData = match.requests;
        }
        else if (idx > this.matchData.length) {
          this.make_alert('Error in update match data. ' + idx + ' is greater than current length ' + this.matchData.length, data);
        }
        else {
          this.matchData[idx] = match;
        }
      }
      this.currentDataIndex = this.matchData.length - 1;
      if (this.currentDataIndex > this.maxPlayedDataIndex) {
        this.maxPlayedDataIndex += 1;
        this.currentDataIndex = this.maxPlayedDataIndex;
      }
      this.updateMatch(this.matchData[this.currentDataIndex]);
    },
    refreshData() {
      this.wrongProtocol();
      if (this.refreshTimeout != null)
        clearTimeout(this.refreshTimeout);
      if (this.matchData.length > this.maxPlayedDataIndex + 1) {
        // in auto play, no need to refresh data
        this.updateMatchData([], this.animationInterval);
        return;
      }
      let next_idx = this.matchData.length;
      function successFunc(data) {
        if (!data) return; // error on previous or empty data, no need to update
        let interval = 0;
        if (data.length == 0) interval = this.refreshInterval; // no data received, refresh later
        else interval = this.animationInterval; // valid data received, refresh immediately
        this.updateMatchData(data, interval);
        this.updateRequestData();
      }
      function checkFunc(response) {
        let err_msg = 'Error in refreshing data. ';
        if (!response.ok) {
          response.json().then(data => {
            if (data.detail == 'UUID not match') {
              // UUID not match, stop refreshing
              this.UUIDDifferent(null);
              return;
            }
            throw new Error(this.$t('Network response is not ok with detail ') + JSON.stringify(data.detail));
          })
          .catch(error => {
            this.make_alert(this.$t(err_msg) + error.message, error)
            if (stopServerConnection) this.stopServerByError();
          });
        }
        else return response.json();
      }
      HTTP.getState(
        this.serverURL,
        'after',
        next_idx,
        -1,
        this.matchUUID,
        successFunc.bind(this),
        checkFunc.bind(this),
        this.getFailFunc('Error in refreshing data. ', true).bind(this)
      );
      return;
    },
    updateRequestData() {
      function successFunc(data) {
        if (!data) return; // error on previous or empty data, no need to update
        if (!this.match) return; // match has been cleared
        if (JSON.stringify(this.requestData) == JSON.stringify(data)) return;
        console.log('Request data', data);
        let old_req_data = this.requestData;
        this.requestData = data;
        let pid = this.currentRequestPlayerId;
        if (pid != null) {
          // if requests related to pid not change, do not update
          let now = old_req_data.filter(r => r.player_idx == pid);
          let receive = data.filter(r => r.player_idx == pid);
          if (JSON.stringify(now) == JSON.stringify(receive)) return;
        }
        this.updateMatch();
        if (this.match.requests.length > 0)
          this.selectedRequest = this.match.requests[0];
      }
      HTTP.getRequest(
        this.serverURL,
        -1,
        successFunc.bind(this),
        this.getCheckFunc('Error in refreshing data. ', true).bind(this),
        this.getFailFunc('Error in refreshing data. ', true).bind(this)
      );
      return;
    },
    showRequestDetails(request) {
      this.selectedRequest = request;
    },
    hideRequestDetails() {
      // this.selectedRequest = null;
    },
    selectRequest(request) {
      let request_idx = request.idx;
      let req = this.$store.state.requests[request_idx];
      if (req && req.name == 'UseSkillRequest') {
        let table = this.match.player_tables[req.player_idx];
        let char = table.characters[table.active_character_idx];
        let skill = char.skills[req.skill_idx];
        this.$store.commit('setSelectedObject', {
          type: 'SKILL',
          skill_type: skill.skill_type,
          character_name: char.name,
          name: skill.name,
          desc: skill.desc,
          version: char.version,
        });
      }
      if (request.prediction) {
        this.predictFullMatch = request.prediction;
      }
      if (request_idx !== null && request_idx !== undefined) this.$store.commit('selectRequest', request_idx);
    },
    selectClass(title, idx) {
      if (title == 'Confirm') {
        // can use when command string is generated
        if (this.$store.state.commandString != '') {
          return 'select-highlight'
        }
        else {
          return 'select-disabled'
        }
      }
      else if (title == 'Cancel') {
        // can use when request selected or in prediction mode
        if (this.$store.state.selectedRequest != null || this.predictFullMatch) {
          return 'select-highlight'
        }
        else {
          return 'select-disabled'
        }
      }
      else {
        if (idx === undefined || idx === null) {
          // no corresponding request
          return 'select-disabled'
        }
        // for others, whether idx matches selectedRequest
        if (this.$store.state.selectedRequest == idx) {
          return 'select-highlight'
        }
        else {
          return 'select-none'
        }
      }
    },
    cancelSelection() {
      this.$store.commit('selectRequest', null);
      this.predictFullMatch = null;
    },
    confirmSelection() {
      this.predictFullMatch = null;
      if (this.$store.state.commandString == '') return
      console.log('Command: ' + this.$store.state.commandString)
      this.interactionInput = this.$store.state.commandString;
      this.sendInteraction();
    },
    clickCheckShowDeck() {
      this.wrongProtocol();
      if (this.showDeckDiv) {
        // is shown, if modified, give confirm
        if (this.$store.state.deckModifyCounter > 0) {
          let userConfirmation = confirm(
            this.$t('Deck is modified, are you sure to close it?')
          );
          if (!userConfirmation) return;
        }
        this.$store.commit('resetDeckModifyCounter', null);
        this.$store.commit('setShowDeckDiv', false);
        return;
      }
      // first receive deck info from server, then show deck div
      this.$store.commit('resetDeckModifyCounter', null);
      function successFunc(data) {
        this.$store.commit('setDeck', data);
        this.$store.commit('setShowDeckDiv', true);
      }
      let err_msg = 'Error in getting deck. If this error occurs frequently, please try refreshing the page. Detail: ';
      HTTP.getDecks(
        this.serverURL,
        successFunc.bind(this),
        this.getCheckFunc(err_msg).bind(this),
        this.getFailFunc(err_msg).bind(this)
      );
      return;
    },
    clickStartNewMatch() {
      this.wrongProtocol();
      let userConfirmation = confirm(
        this.$t('Are you sure to start a new match?')
      );
      if (!userConfirmation) return;
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
      function successFunc(data) {
        this.clearAllData();
        this.refreshData();
      }
      let err_msg = 'Error in reset game. ';
      HTTP.postReset(
        this.serverURL,
        {},
        successFunc.bind(this),
        this.getCheckFunc(err_msg).bind(this),
        this.getFailFunc(err_msg).bind(this)
      );
      return;
    },
    resetByIndex() {
      let current_index = this.currentDataIndex;
      let match = this.matchData[current_index];
      if (match.requests.length == 0) {
        this.sendNotify({
          text: this.$t('No available action at current index! cannot reset to this index.'),
          type: 'error'
        });
        return;
      }
      let userConfirmation = confirm(
        this.$tc('Are you sure to reset match to current index?', this.currentDataIndex)
      );
      if (!userConfirmation) return;
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
      function successFunc(data) {
        this.clearAllData();
        this.refreshData();
      }
      let err_msg = 'Error in reset game. ';
      HTTP.postReset(
        this.serverURL,
        { match_state_idx: current_index },
        successFunc.bind(this),
        this.getCheckFunc(err_msg).bind(this),
        this.getFailFunc(err_msg).bind(this)
      );
      return;
    },
    stopRefresh() {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    },
    imgSrcError(event) {
      event.target.style.display = 'none';

      let nextElement = event.target.nextElementSibling;
      if (nextElement) {
        nextElement.style.display = 'flex';
      }
    },
    imageAlt(card) {
      let type = card.type;
      if (type == 'TALENT') {
        type = type + '_' + card.character_name;
      }
      if (card.name == 'Unknown') type = 'CARD'
      return this.$t(type + '/' + this.$store.getters.getNameWithDesc(card));
    },
    updateImageWidth(event) {
      if (!navigator.userAgent.includes('Firefox')) return;
      // only firefox needs to set fixed width and height
      let target = event.target;
      let width = target.offsetWidth;
      let height = target.offsetHeight;
      target.style.width = width + 'px';
      target.style.height = height + 'px';
    }
  },
  computed: {
    isSelfPage() {
      return window.location.href.includes('zyr17.cn');
    },
    match () {
      let fullMatch = this.fullMatch;
      if (fullMatch && fullMatch.player_tables) {
        for (let pt of fullMatch.player_tables) {
          if (pt.characters) {
            for (let c of pt.characters) {
              // check if use attaches in characters
              if (c.attaches) {
                c.status = []
                for (let obj of c.attaches)
                  if (obj.type == 'WEAPON') c.weapon = obj;
                  else if (obj.type == 'ARTIFACT') c.artifact = obj;
                  else if (obj.type == 'TALENT') c.talent = obj;
                  else c.status.push(obj);
              }
            }
          }
        }
      }
      if (!fullMatch || this.displayInJudgeMode || this.playerTableOrder == -1) return fullMatch;
      let match = JSON.parse(JSON.stringify(fullMatch));
      let opponent_table = match.player_tables[1 - this.playerTableOrder];
      // console.log(match, this.fullMatch)
      for (let i = 0; i < opponent_table.hands.length; i++) {
        opponent_table.hands[i].name = 'Unknown';
        opponent_table.hands[i].desc = '';
        opponent_table.hands[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.table_deck.length; i++) {
        opponent_table.table_deck[i].name = 'Unknown';
        opponent_table.table_deck[i].desc = '';
        opponent_table.table_deck[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.dice.colors.length; i ++ )
        opponent_table.dice.colors[i] = 'UNKNOWN';
      return match;
    },
    predictMatch() {
      let fm = this.predictFullMatch;
      if (!fm || this.displayInJudgeMode || this.playerTableOrder == -1) return fm;
      let match = JSON.parse(JSON.stringify(fm));
      let opponent_table = match.player_tables[1 - this.playerTableOrder];
      // console.log(match, this.fullMatch)
      for (let i = 0; i < opponent_table.hands.length; i++) {
        opponent_table.hands[i].name = 'Unknown';
        opponent_table.hands[i].desc = '';
        opponent_table.hands[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.table_deck.length; i++) {
        opponent_table.table_deck[i].name = 'Unknown';
        opponent_table.table_deck[i].desc = '';
        opponent_table.table_deck[i].version = 'Unknown';
      }
      for (let i = 0; i < opponent_table.dice.colors.length; i ++ )
        opponent_table.dice.colors[i] = 'UNKNOWN';
      return match;
    },
    sortedPlayerTables() {
      if (this.playerTableOrder == -1) return []
      if (this.playerTableOrder == 1) {
        return this.match.player_tables
      } else {
        return [this.match.player_tables[1], this.match.player_tables[0]]
      }
    },
    sortedPredictPlayerTables() {
      if (this.playerTableOrder == -1) return []
      if (this.playerTableOrder == 1) {
        return this.predictMatch.player_tables
      } else {
        return [this.predictMatch.player_tables[1], this.predictMatch.player_tables[0]]
      }
    },
    currentRequestPlayerId() {
      let match = this.match;
      if (!match || !match.requests || match.requests.length === 0) return null;
      if (!this.displayInJudgeMode) return this.playerTableOrder;
      return match.requests[0].player_idx;
    },
    currentRespondingPlayerId() {
      let match = this.match;
      if (!match || !match.requests || match.requests.length === 0) return null;
      // not in judge mode, and current player has request, return current player
      if (!this.displayInJudgeMode && match.requests.filter(r => r.player_idx == this.playerTableOrder).length > 0) return this.playerTableOrder;
      // otherwise, return first request player
      return match.requests[0].player_idx;
    },
    buttonRequests() {
      // requests that show in right button. current id same, and not card.
      // let res = this.match.requests.filter(request => request.player_idx === this.currentRequestPlayerId);
      let res = this.$store.state.requests;
      res = res.filter(request => request.name !== 'UseCardRequest');
      let finalres = {};
      for (let i = 0; i < this.match.skill_predictions.length; i ++ ) {
        let pred = this.match.skill_predictions[i];
        if (pred.player_idx == this.currentRequestPlayerId) {
          let name = 'UseSkill' + pred.skill_idx;
          let char = this.match.player_tables[pred.player_idx].characters[pred.character_idx];
          let key = 'SKILL_' + char.name + '_' + char.skills[pred.skill_idx].skill_type + '/' + char.skills[pred.skill_idx].name;
          let diff = pred.diff;
          let fake_datas = [
            {
              type: 'FULL',
              match: this.fullMatch
            },
            {
              type: 'DIFF',
              match_diff: diff,
            }
          ];
          fake_datas = this.decodeDiffMatchData(fake_datas);
          // keep dice, hand in fake data same as original
          let fake_match = fake_datas[1].match;
          for (let i = 0; i < 2; i ++ ) {
            fake_match.player_tables[i].dice = this.fullMatch.player_tables[i].dice;
            fake_match.player_tables[i].hands = this.fullMatch.player_tables[i].hands;
          }
          // for rhodeia summon, when it is newly summoned (not appear in current match), change it to fake summon.
          // TODO: when summon number exceeded max, renew summon info is shown. Not very important, ignore it now.
          let fake_summon = {
            name: 'Oceanic Mimic: Squirrel',
            version: '3.3',
            desc: '',
            usage: '',
            max_usage: '',
            damage_elemental_type: 'HYDRO',
            damage: '',
            icon_type: 'NONE'
          }
          for (let i = 0; i < fake_match.player_tables.length; i ++ ) {
            let table = fake_match.player_tables[i];
            let ori_table = this.fullMatch.player_tables[i];
            for (let j = ori_table.summons.length; j < table.summons.length; j ++ ) {
              // only consider newly summoned
              if (
                table.summons[j].name == 'Oceanic Mimic: Squirrel'
                || table.summons[j].name == 'Oceanic Mimic: Raptor'
                || table.summons[j].name == 'Oceanic Mimic: Frog'
              ) {
                table.summons[j] = fake_summon;
              }
            }
          }
          finalres[name] = {
            title: this.$t(key),
            prediction: fake_match,
            cost: char.skills[pred.skill_idx].cost,
          };
        }
      }
      for (let i = 0; i < res.length; i++) {
        let request = res[i];
        let name = request.name.replace('Request', '');
        if (request.name == 'UseSkillRequest') {
          let skill_idx = request.skill_idx;
          finalres[name + skill_idx] = {...finalres[name + skill_idx], ...request};
          let char = this.match.player_tables[request.player_idx].characters[request.character_idx];
          let key = 'SKILL_' + char.name + '_' + char.skills[skill_idx].skill_type + '/' + char.skills[skill_idx].name;
          finalres[name + skill_idx].title = this.$t(key);
        }
        else if (request.name == 'SwitchCharacterRequest') {
          let character_idx = request.target_character_idx;
          let characters = this.match.player_tables[request.player_idx].characters;
          let target = characters[character_idx];
          let name = 'SwitchCharacter';
          request.title = this.$t('Switch To ') + this.$t('CHARACTER/' + target.name);
          if (this.$store.state.selectedRequest !== null) {
            let selectedRequest = this.$store.state.requests[this.$store.state.selectedRequest];
            if (selectedRequest.idx == request.idx) {
              finalres[name] = request;
            }
          }
        }
        else {
          finalres[name] = request;
          request.title = this.$t({
            SwitchCard: 'Switch Card',
            RerollDice: 'Reroll Dice',
            ChooseCharacter: 'Choose Character',
            ElementalTuning: 'Elemental Tuning',
            DeclareRoundEnd: 'Declare Round End',
          }[name]);
        }
      }
      return finalres;
    },
    prevButtonRequests() {
      // filter out DeclareRoundEnd and SwitchCharacter
      let br = this.buttonRequests;
      let res = {}
      for (let key in br) {
        if (key != 'DeclareRoundEnd' && key != 'SwitchCharacter') {
          res[key] = br[key];
        }
      }
      return res;
    },
    descData() {
      let data = this.$store.state.selectedObject;
      if (data === null)
        return []
      if (data.name == 'Unknown') return []
      if (data.type == 'CHARACTER') {
        // show skills of characters
        let res = [
          {
            type: 'CHARACTER',
            name: data.name,
            desc: data.desc,
            version: data.version,
          }
        ];
        for (let i = 0; i < data.skills.length; i ++ ) {
          let skill = data.skills[i];
          res.push({
            type: 'SKILL_' + data.name + '_' + skill.skill_type,
            skill_type: skill.skill_type,
            name: skill.name,
            desc: skill.desc,
          })
        }
        return res;
      }
      if (data.type == 'TALENT') {
        // add character name into type
        let res = [
          {
            type: 'TALENT_' + data.character_name,
            name: data.name,
            desc: data.desc,
            version: data.version,
          }
        ];
        return res;
      }
      if (data.type == 'SKILL') {
        // add character name and skill type
        let res = [
          {
            type: 'SKILL_' + data.character_name + '_' + data.skill_type,
            skill_type: data.skill_type,
            name: data.name,
            desc: data.desc,
            version: data.version,
          }
        ];
        return res;
      }
      return [data]
    },
    isYourTurn() {
      return this.match.current_player == this.playerTableOrder
    },
    skillNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'USE_SKILL') return null;
      let position = this.match.last_action.skill_position;
      let skills = this.match.player_tables[position.player_idx].characters[position.character_idx].skills;
      for (let i = 0; i < skills.length; i ++ ) {
        if (skills[i].id == position.id) {
          let char = this.match.player_tables[position.player_idx].characters[position.character_idx];
          let ret = {
            player_id: position.player_idx,
            character_name: char.name,
            character_desc: char.desc,
            skill_type: skills[i].skill_type,
            skill_name: skills[i].name,
          };
          this.$store.commit('setSelectedObject', { version: char.version, character_name: char.name, ...skills[i] });
          return ret;
        }
      }
      console.error('Cannot find skill');
      return null;
    },
    cardNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'USE_CARD') return null;
      let position = this.match.last_action.card_position;
      let table = this.match.player_tables[position.player_idx];
      let hands = table.hands;
      let ret = {
        player_id: position.player_idx,
      };
      let full_hands = hands.slice();
      if (table.using_hand != null) full_hands.push(table.using_hand);
      for (let i = 0; i < full_hands.length; i ++ ) {
        if (full_hands[i].id == position.id) {
          ret = { ...ret, ...full_hands[i] };
          break;
        }
      }
      if (ret.name == null) {
        console.error('Cannot find card');
        return null;
      }
      this.$store.commit('setSelectedObject', ret);
      return ret;
    },
    switchNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'SWITCH_CHARACTER') return null;
      let char = this.match.player_tables[this.match.last_action.player_idx].characters[this.match.last_action.character_idx];
      this.$store.commit('setSelectedObject', char);
      return {
        player_id: this.match.last_action.player_idx,
        character_name: char.name,
        character_desc: char.desc,
      };
    },
    roundEndNotify() {
      if (!this.match) return null;
      if (this.match.last_action.type != 'DECLARE_ROUND_END') return null;
      return { player_id: this.match.last_action.player_idx };
    },
    waitOpponentNotify() {
      if (!this.match) return null;
      let reqs = this.match.requests.filter(
        r => (
          r.name == 'RerollDiceRequest'
          || r.name == 'SwitchCardRequest'
          || r.name == 'ChooseCharacterRequest'
        )
      );
      let self = this.currentRequestPlayerId;
      if (self == null) return null;
      let self_reqs = reqs.filter(r => r.player_idx == self);
      let opponent_reqs = reqs.filter(r => r.player_idx != self);
      if (self_reqs.length == 0 && opponent_reqs.length > 0) return true;
      return null;
    },
    showDeckDiv() {
      return this.$store.state.showDeckDiv;
    },
    roomName: {
      get () {
        return this.$store.state.roomName;
      },
      set (value) {
        // if room name changes, stop refreshing.
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = null;
        this.$store.commit('setRoomName', value);
      }
    },
    roomServerURL: {
      get () {
        return this.$store.state.roomServerURL;
      },
      set (value) {
        // if URL changes, stop refreshing.
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = null;
        this.roomServerURLValue = value;
        this.$store.commit('setRoomServerURL', value);
      }
    },
    serverURL: {
      get () {
        return this.$store.state.serverURL;
      },
      set (value) {
        // if URL changes, stop refreshing.
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = null;
        this.$store.commit('setServerURL', value);
      }
    },
    imageResourceURL: {
      get () {
        return this.$store.state.imageResourceURL;
      },
      set (value) {
        this.$store.commit('setImageResourceURL', value);
      }
    },
    serverConnected: {
      get () {
        return this.$store.state.serverConnected;
      },
      set (value) {
        this.$store.commit('setServerConnected', value);
      }
    },
    currentLanguage: {
      get () {
        return this.$store.state.frontendLanguage;
      },
      set (value) {
        this.$store.commit('setFrontendLanguage', value);
        document.title = this.$t('LPSim: Title');
      }
    },
    animationInterval: {
      get () {
        return this.$store.state.animationInterval;
      },
      set (value) {
        this.$store.commit('setAnimationInterval', value);
      }
    },
    // match: {
    //   get() {
    //     console.log('get', this._match);
    //     return this._match;
    //   },
    //   set(value) {
    //     value.modified = true;
    //     console.log('set', value);
    //     this._match = value;
    //     this.$forceUpdate();
    //   }
    // }
  },
  // watch: {
  //   buttonRequests(newVal, oldVal) {
  //     let finalres = newVal;
  //     console.log(123)
  //     console.log(finalres, Object.keys(finalres).length);
  //     if (Object.keys(finalres).length == 1) {
  //       let finalres_name = Object.keys(finalres)[0];
  //       this.$store.commit('selectRequest', finalres[finalres_name].idx)
  //     }
  //   }
  // }
}
</script>

<!-- CSS libraries -->
<style src="normalize.css/normalize.css"></style>

<!-- Global CSS -->
<style>

div {
  box-sizing: border-box;
  /* border: 1px solid black; */
}

</style>

<style scoped>

.header-div-container {
  position: relative;
  width: 100%;
  padding-bottom: 5vw;
  z-index: 999;
}

.header-div {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  top: 0;
  left: 0;
  width: 100%;
  height: 5vw;
}

label {
  display: block;
  margin-bottom: 0.5vw;
}

.text-div {
  display: block;
  width: 10%;
  height: 100%;
  font-size: 1vw;
  /* margin-bottom: 1rem; */
  /* margin-left: 20%; */
}

textarea {
  font-family: monospace;
  font-size: 0.9em;
  border-radius: 0.02vw;
  border: 1px solid #ccc;
  width: 95%;
  height: 100%;
}

.buttons-div, .interaction-div {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.buttons-div {
  width: 15%;
}

.parse-button-container {
  text-align: center;
}

button {
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 0.3vw;
  padding: 0.25vw 0.5vw;
  font-size: 1em;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed !important;
  background-color: #cccccc !important;
  color: #888888 !important;
}

button:hover {
  background-color: #3e8e41;
}

.match-container, .empty-container {
  position: relative;
  width: 90%;
  height: 0;
  padding-bottom: 45%; /* 16:9 aspect ratio */
  /* margin-left: 10%; */
  /* display: flex;
  flex-direction: column; */
}

.desc-container {
  position: absolute;
  width: 11.11111111111%;
  padding: 1%;
  height: 100%;
  font-size: 0.75vw;
  overflow-y: scroll;
}

.player-tables-container {
  position: absolute;
  width: 88.888888888888%;
  left: 11.111111111111%;
  height: 100%;
}

.player-tables {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
}

.player-tables > * {
  height: 100%;
}

.player-tables-container{
  border: 1px solid #3e8e41;
}

.requests-button-container {
  position: absolute;
  /* left: 88.888888888889%; */
  left: 100%;
  width: 5.555555555555%;
  margin-left: 1%;
  height: 100%;
}

.prev-buttons {
  width: 100%;
  height: 66.6666666667%;
}

.prev-buttons > * {
  width: 100%;
  height: 16.6666666667%;
  padding: 5%;
}

.prev-buttons > * > *, .last-buttons > * > * {
  width: 100%;
  height: 100%;
}

.last-buttons {
  width: 100%;
  height: 33.3333333333%;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
}

.last-buttons > * {
  width: 100%;
  height: 33.3333333333%;
  padding: 5%;
}

/* styles for the data navigation buttons */
.data-navigation > div, .interaction-button-group {
  display: flex;
  justify-content: center;
  align-items: center;
}

.data-navigation {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  align-items: center;
}

.data-navigation label {
  margin: 0.1vw 0;
}

.data-navigation button, .interaction-button-group button {
  margin: 0 0.1vw;
}

.data-navigation button {
  height: 60%;
}

.data-navigation button:hover {
  background-color: #3e8e41;
}

.data-navigation input {
  width: 80%;
}

.data-navigation > div {
  width: 100%;
}

.data-navigation > div > div {
  width: 40%;
}

.data-navigation > div > button {
  width: 30%;
}

.requests-div {
  position: relative;
  width: 150px;
}

.requests-div ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.requests-div li {
  margin-top: 5px;
  border: 3px solid #ccc;
  border-radius: 5px;
  background: #eee;
}

.request-details {
  position: relative;
  /* position: absolute;
  top: 0;
  left: -300%;
  width: 300%; */
  width: 10%;
  /* padding: 10px; */
  z-index: 9999;
}

.player-table-order {
  display: flex;
  justify-content: center;
  /* flex-direction: column; */
  align-items: center;
}

.order-div > label {
  display: flex;
  align-items: center;
  margin: 0vw 0vw;
}

.order-div input[type="radio"] {
  margin: 0 0.5vw;
}

.player-tables > * {
  border: 3px solid white;
}

.table-current-player {
  border-color: orange;
}

.table-current-request {
  animation: blink-current-request 3s linear infinite;
  background-color: white;
}

@keyframes blink-current-request {
  0% { background-color: white; }
  50% { background-color: rgb(215, 236, 255); }
  100% { background-color: white; }
}

.deck-start-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 5%;
}

.radios-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 11%;
}

.order-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 9%;
}

.radios-div > p, .order-div > p {
  margin: 0.0vw 0 0 0;
  font-weight: bold;
}

.radios-div label {
  margin-bottom: 0.00vw;
  display: flex;
  align-items: center;
}

.main-info-div {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 30%;
}

.debug-refresh-freq-div {
  width: 15%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.server-refresh-div {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 20%;
}

.server-refresh-div > div {
  display: flex;
  justify-content: space-around;
}

.server-url-div {
  height: 45%;
}

.server-url-div > label {
  width: 15%;
}

.server-url-div > input {
  width: 50%;
}

.server-url-div > button {
  width: 25%;
  margin: 0.2vw 0.05vw;
  padding: 0 0.05vw;
}

.animation-freq-div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 35%;
}

.animation-freq-div > label {
  width: 65%;
  margin: 0;
}

.animation-freq-div > input {
  width: 30%;
  margin-right: 5%;
}

.freq-div {
  display: flex;
  justify-content: center;
  align-items: center;
}

.reset-refresh-div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 65%;
}

.reset-refresh-div > .reset-button {
  width: 40%;
}

.reset-refresh-div > span {
  width: 30%;
  margin: 0 2.5%;
  text-align: center;
}

.refresh-debug-div {
  width: 5%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.refresh-debug-div > button {
  /* background-color: #76cc79; */
  opacity: 0.5;
}

.refresh-debug-div > button:hover {
  opacity: 1;
}

.header-div {
  font-size: 0.8vw;
}

.skill-notify-container, .switch-notify-container {
  position: absolute;
  top: 0;
  left: 11.11111111111%;
  width: 44.44444444444%;
  height: 50%;
  font-size: 1.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.skill-notify-container > div, .switch-notify-container > div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 33%;
  /* width: 80%; */
  background-color: white;
  box-shadow: 0 0 0.7vw 0.7vw rgb(255, 174, 0);
  border-radius: 1000px;
  padding-right: 5%;
}

.skill-notify-container > div > img, .switch-notify-container > div > img {
  height: 100%;
}

.skill-notify-container > div > div > p, .switch-notify-container > div > div > p {
  white-space: nowrap;
  padding-left: 5%;
}

.card-notify-container {
  position: absolute;
  top: 0;
  left: 11.11111111111%;
  width: 44.44444444444%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-text-notify-container {
  position:absolute;
  height: 15%;
  width: 30%;
  left: 40.11111111111%;
  top: 42.5%;
  border-radius: 10000px;
  font-size: 2vw;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: white;
  box-shadow: 0 0 0.7vw 0.7vw rgb(255, 174, 0);
  padding: 0 5%;
}

.prediction-notify-container {
  opacity: 0.2;
  position: absolute;
  width: 85%;
  left: 11.111111111111%;
  height: 100%;
  font-size: 2vw;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  pointer-events: none;
}

.prediction-notify-container > div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 33%;
  width: 19%;
}

.card-notify-container > * {
  height: 50%;
  box-shadow: 0 0 0.7vw 0.7vw rgb(255, 174, 0);
  border-radius: 1.3vw;
}

.notify-right-part {
  left: 55.55555555555%;
}

.opponent-shadow-color {
  box-shadow: 0 0 0.7vw 0.7vw rgb(0, 145, 255) !important;
}

.deck-container {
  position: relative;
  width: 90%;
  height: 0;
  padding-bottom: 45%; /* 16:9 aspect ratio */
  /* margin-left: 10%; */
  /* display: flex;
  flex-direction: column; */
  font-size: 1vw;
}

.deck-container-inner {
  position: absolute;
  width: 88.888888888888%;
  left: 11.111111111111%;
  height: 100%;
  display: flex;
  align-items: left;
  flex-direction: column;
}

.deck-container-inner > * {
  height: 50%;
}

.freq-label-warning {
  animation: blink-label-warning 2s linear infinite;
  font-weight: bold;
}

@keyframes blink-label-warning {
  0% { color: black; }
  40% { color: red; }
  60% { color: red; }
  100% { color: black; }
}

.blink-refresh-button {
  /* animation: blink-not-refresh 2s linear infinite; */
  background-color: #ffa500;
}

@keyframes blink-not-refresh {
  0% { background-color: #4caf50; }
  40% { background-color: rgb(255, 92, 38); }
  60% { background-color: rgb(255, 92, 38); }
  100% { background-color: #4caf50; }
}

#overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2); /* Semi-transparent black */

  /* Add these lines to center the content */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
}

#overlay-content {
  width: 40%;
  font-size: 1vw;
  background-color: white;
  padding: 20px;
  border-radius: 1vw;
  box-shadow: 0 0 0.7vw 0.7vw rgb(255, 174, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1200px) {
  #overlay-content {
    width: 80%;
  }
}

.overlay-content-div {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.overlay-content-div > input {
  width: 75%;
}

.overlay-content-div > label {
  width: 25%;
}

#overlay-content > h2 {
  margin-top: 0;
}

.overlay-desc-div {
  font-size: 1vw;
}

.overlay-desc-div p {
  margin: 0.2vw 0;
}

.overlay-desc-div .room-name-desc {
  padding-left: 2em;
}

#overlay-content .player-table-order {
  width: 70%;
  justify-content: center;
}

#overlay-content .player-table-order label {
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 0 2vw;
}

#footer {
  margin-top: 1vw;
  width: 100%;
}

#footer > * {
  margin: 0;
}

#footer > h5 {
  margin-top: 0.5vw;
}

#footer a {
  text-decoration: none;
  color: gray;
  font-size: 0.75vw;
  margin-right: 0.5vw;
}

#disclaimer {
  font-size: 0.75vw;
}

.overlay-button-div {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
}

.important-strong {
  color: rgb(207, 0, 0);
}

.card-notify-text {
  display: none;
  align-items: center;
  justify-content: center;
  height: 50%;
  width: 33%;
  font-size: 3vw;
  border: 0.1vw;
  border-color: #6B5531;
  border-style: solid;
  border-radius: 0.5vw;
  background: white;
}

.blink-refresh-span {
  animation: blink-not-refresh-span 2s linear infinite;
  /* color: red;
  font-weight: bold; */
}

@keyframes blink-not-refresh-span {
  0% { color: #000; font-weight: bold }
  40% { color: rgb(255, 92, 38); font-weight: bold }
  60% { color: rgb(255, 92, 38); font-weight: bold }
  100% { color: #000; font-weight: bold }
}

</style>

<style>

body {
  font-family: "Microsoft YaHei", sans-serif;
}

span {
  user-select: none;
  cursor: default;
}

#app .vue-notification {
  font-size: 1.25vw;
  padding: 0.5vw;
  margin: 0.3vw;
}

</style>
