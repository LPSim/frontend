<template>
  <div :class="tableClass" @click="log_data">
    <div class="supports-charactors-summons">
      <div class="supports">
        <!-- <h3>Supports</h3> -->
        <div v-for="support in playerTable.supports" :key="support.id" @click="selectObject(support.position)">
          <Support :support="support" :select-class="selectObjectClass(support.position)" />
        </div>
      </div>

      <div class="multi-position" v-if="multiplePositionList">
        <h4>This action has multiple positions, please select below.</h4>
        <p>Charactor ID start from 0.</p>
        <div class="multi-position-choices">
          <label clsss="multi-position-one-choice" v-for="(plist, pidx) in multiplePositionList" :key="pidx">
            <input type="radio" :name="'multi-position-choice'" :value="pidx" @click="selectMultiplePosition(pidx)" />
            <br>
            <span class="multi-position-one-choice-title">From:</span><br>
            {{ plist[0].charactor_name }}:{{ plist[0].charactor_idx }}<br>
            <span class="multi-position-one-choice-title">To:</span><br>
            {{ plist[1].charactor_name }}:{{ plist[1].charactor_idx }}<br>
          </label>
        </div>
      </div>

      <div v-else class="charactors">
        <!-- <h3>Characters</h3> -->
        <div :class="{'charactor-div': true, 'charactor-div-active': cid == playerTable.active_charactor_idx}" v-for="(charactor, cid) in playerTable.charactors" :key="charactor.id" @click="selectCharactor(charactor.position)">
          <div class="active-div" v-if="(playerTable.active_charactor_idx != cid) != is_reverse" @click.stop=""></div>
          <Charactor class="charactor-inner" :charactor="charactor" :select-class="selectCharactorClass(charactor.position)" />
          <div class="team-status-div" v-if="playerTable.active_charactor_idx == cid">
            <!-- <h3>Team Status</h3> -->
            <div v-for="(status, sid) in playerTable.team_status" :key="sid" @mouseover="showDetails(status)" @mouseout="hideDetails(status)" @click="log_status(sid)">
              <img :src="status_path(status)" width="100%" height="100%" />
              <div class="usage-span-div">
                <span v-if="status.usage && status.usage > 0">{{ status.usage }}</span>
              </div>
            </div>
          </div>
          <div v-if="showDetailsFlag && (playerTable.active_charactor_idx == cid)" class="status-details">
            <div class="p-div">
              <h4>{{ detailData.name }}</h4>
              <p>{{ detailData.desc }}</p>
              <!-- <p>Usage: {{ detailData.usage }}</p> -->
            </div>
          </div>
        </div>
      </div>

      <div class="summons">
        <!-- <h3>Summons</h3> -->
        <div v-for="summon in playerTable.summons" :key="summon.id" @click="selectObject(summon.position)">
          <Summon :summon="summon" :select-class="selectObjectClass(summon.position)" />
        </div>
      </div>
      <div class="dice" @click="log_dice()">
        <div v-for="data in sortedColors" :class="disableDice()" :key="data.idx" @click="selectDice(data.idx)">
          <div :class="'dice-select-border ' + selectDiceClass(data.idx)"></div>
          <img class="cost-img" :src="image_path('dice', data.color)" :alt="data.color" />
          <img class="element-img" :src="image_path('element', data.color)" :alt="data.color" />
        </div>
      </div>
    </div>
    <div class="player-info">
      <div class="player-name">
        <img class="player-icon" :src="image_path('avatar', playerTable.player_name)">
      </div>

      <div class="round-ended-and-arcane">
        <div class="round-ended">
          <p v-if="playerTable.has_round_ended" style="font-weight: bolder; color:rgb(238, 105, 22)">Round has ended</p>
          <p v-else>Round has not ended</p>
        </div>
        <div class="arcane-legend">
          <img :src="image_path('dice', 'ARCANE_' + (playerTable.arcane_legend ? 'FULL' : 'EMPTY'))" height="100%" />
        </div>
      </div>
      <div class="table-deck" v-if="show_table_deck">
        <!-- <h3>Table Deck</h3> -->
        <div v-for="card in playerTable.table_deck" :key="card.id">
          <Card :card="card" />
        </div>
      </div>
      <div class="table-deck" v-else>Table Deck: {{ playerTable.table_deck.length }} cards</div>

      <div class="hands">
        <!-- <h3>Hands</h3> -->
        <div v-for="card, cnum in playerTable.hands" :key="card.id" :class="selectCardClass(cnum)" @click="selectCard(cnum)">
          <Card class="active" :card="card" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Charactor from './Charactor.vue'
import Summon from './Summon.vue'
import Card from './Card.vue'
import Support from './Support.vue'

export default {
  name: 'PlayerTable',
  props: {
    playerTable: {
      type: Object,
      required: true,
      validator: (value) => {
        return ('name' in value && 'player_name' in value
        && 'player_icon' in value && 'active_charactor_idx' in value
        && 'has_round_ended' in value && 'dice' in value && 'team_status' in value
        && 'charactors' in value && 'summons' in value && 'supports' in value
        && 'hands' in value && 'table_deck' in value)
      }
    },
    show_table_deck: {
      type: Boolean,
      default: false
    },
    is_reverse: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      showDetailsFlag: false,
    }
  },
  components: {
    Charactor,
    Summon,
    Card,
    Support
  },
  methods: {
    log_data() {
      console.log('TABLE', JSON.parse(JSON.stringify(this.playerTable)));
    },
    log_dice() {
      console.log('DICE', JSON.parse(JSON.stringify(this.playerTable.dice)));
    },
    log_status(sid) {
      console.log('TEAM_STATUS', JSON.parse(JSON.stringify(this.playerTable.team_status[sid])));
    },
    showDetails(data) {
      this.showDetailsFlag = true;
      this.detailData = data;
    },
    hideDetails() {
      this.showDetailsFlag = false;
    },
    selectCardClass(cidx) {
      if (this.$store.state.selectedRequest == null) {
        // request not selected, if have this card in request, show it
        let requests = this.$store.state.requests;
        for (let rid = 0; rid < requests.length; rid++) {
          let request = requests[rid];
          if (request.name != 'UseCardRequest') continue;
          if (request.card_idx == cidx && request.player_idx == this.playerTable.player_idx)
            return 'select-highlight';
        }
        return '';
      }
      // request is selected, if card is corresponding request, select it.
      // otherwise, disable.
      let request = this.$store.state.requests[this.$store.state.selectedRequest];
      if (request.name == 'UseCardRequest') {
        if (request.card_idx == cidx && request.player_idx == this.playerTable.player_idx)
          return 'select-selected';
        else
          return 'select-disabled';
      }
      // request is selected, if card position in store position, show it
      let positions = this.$store.state.positions;
      let card = this.playerTable.hands[cidx];
      for (let pid = 0; pid < this.$store.state.selectedPositions.length; pid ++ ) {
        let position_idx = this.$store.state.selectedPositions[pid];
        let position = positions[position_idx];
        if (position.id == card.id)
          return 'select-selected';
      }
      for (let pid = 0; pid < positions.length; pid++) {
        let position = positions[pid];
        if (position.id == card.id)
          return 'select-highlight';
      }
      return 'select-disabled';
    },
    selectCard(cidx) {
      let card = this.playerTable.hands[cidx];
      if (this.$store.state.selectedRequest == null) {
        // request not selected, if have this card in request, select request
        let requests = this.$store.state.requests;
        for (let rid = 0; rid < requests.length; rid++) {
          let request = requests[rid];
          if (request.name != 'UseCardRequest') continue;
          if (request.card_idx == cidx && request.player_idx == this.playerTable.player_idx) {
            this.$store.commit('selectRequest', rid);
            return;
          }
        }
        return;
      }
      return this.selectObject(card.position)
    },
    selectObjectClass(object_position) {
      if (this.$store.state.selectedRequest == null) {
        // request not selected, none
        return 'select-none';
      }
      let positions = this.$store.state.positions;
      let selected_positions = this.$store.state.selectedPositions;
      for (let pid = 0; pid < selected_positions.length; pid ++ ) {
        let p = positions[selected_positions[pid]];
        if (p.id == object_position.id)
          return 'select-selected';
      }
      for (let pid = 0; pid < positions.length; pid ++ ) {
        let p = positions[pid];
        if (p.id == object_position.id) {
          return 'select-highlight';
        }
      }
      return 'select-disabled';
    },
    selectObject(object_position) {
      if (this.$store.state.selectedRequest == null) {
        // request not selected, if have this card in request, select request
        return;
      }
      // otherwise, if it is in store positions, select it
      let positions = this.$store.state.positions;
      for (let pid = 0; pid < positions.length; pid ++ ) {
        let position = positions[pid];
        if (position.id == object_position.id) {
          this.$store.commit('positionClick', pid);
          return;
        }
      }
    },
    selectMultiplePosition(position_idx) {
      if (this.$store.state.selectedRequest == null) {
        // request not selected
        return;
      }
      this.$store.commit('positionClick', position_idx);
    },
    selectCharactorClass(object_position) {
      let cidx = object_position.charactor_idx;
      if (this.$store.state.selectedRequest == null) {
        // not selected, if contain switch charactor, can select
        let requests = this.$store.state.requests;
        for (let rid = 0; rid < requests.length; rid++) {
          let request = requests[rid];
          if (request.name != 'SwitchCharactorRequest') continue;
          if (request.target_charactor_idx == cidx && request.player_idx == this.playerTable.player_idx)
            return 'select-highlight';
        }
        return 'select-none';
      }
      let request = this.$store.state.requests[this.$store.state.selectedRequest];
      if (request.name == 'SwitchCharactorRequest') {
        if (request.target_charactor_idx == cidx && request.player_idx == this.playerTable.player_idx)
          return 'select-selected';
        else
          return 'select-disabled';
      }
      return this.selectObjectClass(object_position);
    },
    selectCharactor(object_position) {
      let cidx = object_position.charactor_idx;
      if (this.$store.state.selectedRequest == null) {
        // not selected, if contains switch charactor, select
        let requests = this.$store.state.requests;
        for (let rid = 0; rid < requests.length; rid++) {
          let request = requests[rid];
          if (request.name != 'SwitchCharactorRequest') continue;
          if (!(request.target_charactor_idx == cidx && request.player_idx == this.playerTable.player_idx))
            continue;
          this.$store.commit('selectRequest', rid);
          return
        }
        // not found, return
        return
      }
      return this.selectObject(object_position)
    },
    selectDiceClass(dice_idx) {
      if (this.$store.state.selectedRequest == null) {
        // request not selected, none
        return 'select-dice-none';
      }
      if (this.$store.state.requests[this.$store.state.selectedRequest].player_idx != this.playerTable.player_idx) {
        // request not selected, none
        return 'select-dice-none';
      }
      let selected = this.$store.state.selectedDice;
      for (let pid = 0; pid < selected.length; pid ++ ) {
        if (dice_idx == selected[pid])
          return 'select-dice-selected';
      }
      return 'select-dice-none';
    },
    selectDice(dice_idx) {
      if (this.$store.state.selectedRequest == null) {
        // request not selected, none
        return 'select-dice-none';
      }
      if (this.$store.state.requests[this.$store.state.selectedRequest].player_idx != this.playerTable.player_idx) {
        // request not selected, none
        return 'select-dice-none';
      }
      this.$store.commit('diceClick', dice_idx)
    },
    costDefaultSelector() {
      let dice_rule = this.$store.state.diceSelectionRule;
      if (dice_rule.player != this.playerTable.player_idx)
        return;
      if (dice_rule == null || dice_rule.mode == 'any' || dice_rule.mode == 'none')
        return;
      let sorted = this.sortedColors;
      if (dice_rule.mode == 'tune') {
        console.log(sorted)
        this.$store.commit('diceClick', sorted[sorted.length - 1].idx);
        return;
      }
      let cost = dice_rule.cost;
      let selected = [];
      if (cost.same_dice_number > 0) {
        // select same
        let omni_count = 99999, same_count = 99999;
        let is_main = true;
        let done = new Set();
        let main_color = new Set();
        for (let i = 0; i < this.playerTable.charactors.length; i ++ ) {
          let charactor = this.playerTable.charactors[i];
          main_color.add(charactor.element);
        }
        for (let cid = sorted.length - 1; cid >= 0; cid--) {
          let color = sorted[cid].color;
          if (done.has(color)) continue;
          done.add(color);
          let now_selected = [];
          let now_omni_count = 0;
          for (let did = cid; did >= 0; did--) {
            // if (cost.same_dice_number == now_selected.length) break;
            if (sorted[did].color == 'OMNI') {
              now_omni_count += 1;
              now_selected.push(sorted[did].idx);
            }
            else if (sorted[did].color == color) {
              now_selected.push(sorted[did].idx);
            }
          }
          // console.log(color, now_selected, now_omni_count)
          if (now_selected.length < cost.same_dice_number) continue;
          let now_same_count = now_selected.length - now_omni_count;
          // remove overnumber omnis
          if (color != 'OMNI')
            now_omni_count = Math.max(0, cost.same_dice_number - now_same_count);
          // console.log(color, now_selected, now_omni_count,now_same_count, omni_count, same_count)
          // if use more omni, worse, discard
          if (now_omni_count > omni_count) continue;
          let now_is_main = main_color.has(color);
          // if use less omni, better, replace
          if (now_omni_count < omni_count) {
            selected = now_selected.slice(0, cost.same_dice_number);
            omni_count = now_omni_count;
            same_count = now_same_count;
            is_main = now_is_main;
            continue;
          }
          // if omni same, then if current main color and pre not, worse, discard
          if (now_is_main && !is_main) continue;
          // if current not main and pre is, better, replace
          if (!now_is_main && is_main) {
            selected = now_selected.slice(0, cost.same_dice_number);
            omni_count = now_omni_count;
            same_count = now_same_count;
            is_main = now_is_main;
            continue;
          }
          // if omni same, then if use less same, better, replace
          if (now_same_count < same_count) {
            selected = now_selected.slice(0, cost.same_dice_number);
            omni_count = now_omni_count;
            same_count = now_same_count;
            is_main = now_is_main;
            continue;
          }
        }
        for (let cid = 0; cid < selected.length; cid++) {
          this.$store.commit('diceClick', selected[cid]);
        }
        return
      }
      // select element
      for (let cid = sorted.length - 1; cid >= 0; cid--) {
        if (cost.elemental_dice_number == selected.length) break;
        let color = sorted[cid].color;
        if (color == cost.elemental_dice_color || color == 'OMNI') {
          selected.push(sorted[cid].idx);
        }
      }
      // select any
      for (let cid = sorted.length - 1; cid >= 0; cid--) {
        if (cost.any_dice_number + cost.elemental_dice_number == selected.length) break;
        if (selected.indexOf(sorted[cid].idx) == -1)
          selected.push(sorted[cid].idx);
      }
      // commit
      for (let cid = 0; cid < selected.length; cid++) {
        this.$store.commit('diceClick', selected[cid]);
      }
      return;
    },
    disableDice() {
      if (this.$store.state.selectedRequest == null) {
        // request not selected
        return 'select-none';
      }
      if (this.$store.state.requests[this.$store.state.selectedRequest].player_idx != this.playerTable.player_idx) {
        // not this player
        return 'select-dice-disabled';
      }
    },
    status_path(status) {
      let name = status.name;
      if (status.icon_type != 'OTHERS') {
        name = status.icon_type;
      }
      return this.$store.getters.getImagePath({
        type: 'team_status',
        name: name
      })
    },
    image_path(type, name) {
      return this.$store.getters.getImagePath({
        type: type,
        name: name
      })
    }
  },
  computed: {
    tableClass() {
      return this.is_reverse ? 'player-table-reverse' : 'player-table-normal';
    },
    sortedColors() {
      let order = ['OMNI'];
      for (let cid = 0; cid < this.playerTable.charactors.length; cid++) {
        let charactor = this.playerTable.charactors[cid];
        order.push(charactor.element);
        if (charactor.name == 'Maguu Kenki')
          order.push('CRYO')
      }
      let result = [];
      let table_colors = this.playerTable.dice.colors;
      for (let cid = 0; cid < order.length; cid++) {
        let color = order[cid];
        if (order.indexOf(color) != cid) continue;
        for (let did = 0; did < table_colors.length; did++) {
          if (table_colors[did] == color)
            result.push({ idx: did, color: color });
        }
      }
      for (let did = 0; did < table_colors.length; did++) {
        let color = this.playerTable.dice.colors[did];
        if (!order.includes(color))
          result.push({ idx: did, color: color });
      }
      return result
    },
    multiplePositionList() {
      // if target is multiple position, return list; otherwise, return null
      if (this.$store.state.selectedRequest == null) return null;
      if (this.$store.state.requests[this.$store.state.selectedRequest].player_idx != this.playerTable.player_idx) return null;
      if (this.$store.state.positions.length == 0) return null;
      let positions = this.$store.state.positions;
      if (positions[0].positions) {
        // is multiple position instance
        let ret = []
        for (let pid = 0; pid < positions.length; pid++) {
          let position = positions[pid];
          let oneret = []
          for (let ppid = 0; ppid < position.positions.length; ppid++) {
            let pposition = position.positions[ppid];
            oneret.push({
              charactor_idx: pposition.charactor_idx,
              charactor_name: this.playerTable.charactors[pposition.charactor_idx].name,
            });
          }
          ret.push(oneret);
        }
        return ret;
      }
      return null;
    },
    watchSelectedRequest() {
      return this.$store.state.selectedRequest;
    },
  },
  watch: {
    watchSelectedRequest(newVal, oldVal) {
      if (JSON.parse(JSON.stringify(newVal)) == JSON.parse(JSON.stringify(oldVal))) return;
      this.costDefaultSelector();
    }
  }
}
</script>

<style scoped>

.player-table-normal, .player-table-reverse {
  display: flex;
  flex-direction: column;
}

.player-table-reverse {
  flex-direction: column-reverse;
}

.player-info {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  height: 33%;
}

.player-name, .round-ended-and-arcane, .table-deck {
  width: 9%;
  /* height: 100%; */
}

.player-name {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.player-name > img {
  height: 60%;
}

.round-ended-and-arcane {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.round-ended {
  height: 50%;
}

.arcane-legend {
  position: relative;
  height: 50%;
  display: flex;
  justify-content: center;
}

.table-deck {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 10%;
}

.hands {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 73%;
  height: 100%;
}

.hands > * {
  width: 7.7%;
  height: 100%;
}

.supports-charactors-summons {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: flex-start;
  height: 67%;
}

.supports {
  display: flex;
  flex-direction: row;
  width: 17.5%;
  height: 100%;
}

.multi-position {
  display: flex;
  flex-direction: column;
  justify-content:space-around;
  align-items: center;
  width: 60%;
  height: 100%;
  font-size: 1vw;
}

.multi-position > * {
  margin: 0;
}

.multi-position-choices {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
}

.multi-position-one-choice-title {
  font-weight: bold;
}

.charactors {
  display: flex;
  flex-direction: row;
  justify-content:space-around;
  width: 60%;
  height: 100%;
}

.charactors > * {
  width: 13.5%;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.charactors > * > .team-status {
  height: 8.64%;
}

.charactors > * > .active-div {
  height: 8.64%;
}

.charactors > * > .charactor-inner {
  height: 82.72%;
}

.summons, .supports {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 17.5%;
  height: 100%;
}

.summons > div, .supports > div {
  width: 50%;
  height: 50%;
}

.team-status-div {
  display: flex;
  flex-direction: row;
  height: 8.64%;
}

.team-status-div > div {
  position: relative;
  /* width: 10%;
  height: 10%; */
  width: 20%;
  height: 100%;
}

.team-status-div img {
  position: absolute;
}

.usage-span-div {
  position: absolute;
  font-size: 0.5vw;
  font-weight: bolder;
  text-align: center;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: black;
  /* line-height: 130%; */
  color: white;
  /* z-index: 999; */
  display: flex;
  justify-content: center;
  align-items: center;
}

.dice {
  /* position: absolute; */
  /* left: 95.7%; */
  display: flex;
  flex-direction: column;
  width: 4.35%;
  margin-left: 0.65%;
  height: 100%;
  flex-wrap: wrap;
}

.dice > * {
  width: 50%;
  height: 12.5%;
  position: relative;
}

.dice > * > img {
  position: absolute;
  width: 93.75%;
  left: 3.3%;
  height: 100%;
}

.dice > * > .element-img {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.select-none, .select-disabled, .select-highlight, .select-selected {
  border-radius: 0.45vw;
}

.select-disabled {
  box-shadow: 0 0 3px 3px rgb(192, 192, 192);
  opacity: 20%;
}

.select-highlight {
  box-shadow: 0 0 3px 3px rgb(255, 174, 0);
}

.select-selected {
  box-shadow: 0 0 3px 3px rgb(255, 81, 0);
}

.select-dice-none {
  border-radius: 50%;
}

.select-dice-selected {
  border-radius: 50%;
  box-shadow: 0 0 5px 5px rgb(255, 81, 0);
}

.select-dice-disabled {
  border-radius: 5%;
  /* box-shadow: 0 0 3px 3px rgb(192, 192, 192); */
  opacity: 20%;
}

.dice-select-border {
  position: absolute;
  width: 80%;
  height: 80%;
  left: 10%;
  top: 10%;
  border-radius: 50%;
}

.status-details {
  position: absolute;
  top: 0;
  left: -100%;
  top: 17.28%;
  width: 100%;
  height: 82.72%;
  background-color: white;
  border: 1px solid black;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: black;
  z-index: 999;
  font-size: 0.75vw;
  font-weight: normal;
  -webkit-text-stroke-width: 0;
  -webkit-text-stroke-color: black;
}

.status-details > .p-div {
  width: 150%;
  color: black;
  background-color: rgba(255, 255, 255, 0.5);
}
</style>
