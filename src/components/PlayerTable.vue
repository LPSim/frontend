<template>
  <div :class="tableClass" @click="log_data">
    <div class="supports-characters-summons">
      <div class="supports">
        <!-- <h3>Supports</h3> -->
        <div v-for="support in playerTable.supports" :key="support.id" @click="selectObject(support.position)">
          <Support :support="support" :select-class="selectObjectClass(support)" />
        </div>
      </div>

      <div class="multi-position" v-if="multiplePositionList">
        <h4>This action has multiple positions, please select below.</h4>
        <p>Character ID start from 0.</p>
        <div class="multi-position-choices">
          <label clsss="multi-position-one-choice" v-for="(plist, pidx) in multiplePositionList" :key="pidx">
            <input type="radio" :name="'multi-position-choice'" :value="pidx" @click="selectMultiplePosition(pidx)" />
            <br>
            <span class="multi-position-one-choice-title">From:</span><br>
            {{ plist[0].character_name }}:{{ plist[0].character_idx }}<br>
            <span class="multi-position-one-choice-title">To:</span><br>
            {{ plist[1].character_name }}:{{ plist[1].character_idx }}<br>
          </label>
        </div>
      </div>

      <div v-else class="characters">
        <!-- <h3>Characters</h3> -->
        <div :class="{'character-div': true, 'character-div-active': cid == playerTable.active_character_idx}" v-for="(character, cid) in playerTable.characters" :key="character.id" @click="selectCharacter(character.position)">
          <div class="active-div" v-if="(playerTable.active_character_idx != cid) != is_reverse" @click.stop=""></div>
          <Character class="character-inner" :character="character" :select-class="selectCharacterClass(character)" :detail-text-width="detailTextWidth" />
          <div class="team-status-div" v-if="playerTable.active_character_idx == cid">
            <!-- <h3>Team Status</h3> -->
            <div v-for="(status, sid) in playerTable.team_status" :key="sid" @mouseover="showDetails(status)" @mouseout="hideDetails(status)" @click="log_status(sid)">
              <img :src="status_path(status)" width="100%" height="100%" @error="imgSrcError($event)"/>
              <div :class="'status-text status-text-' + status.icon_type.toLowerCase()">
                <span>{{ status.icon_type == 'OTHERS' ? '?' : '●' }}</span>
              </div>
              <div class="usage-span-div">
                <span v-if="status.usage && status.usage > 0">{{ status.usage }}</span>
              </div>
            </div>
          </div>
          <div v-if="showDetailsFlag && (playerTable.active_character_idx == cid)" :class="'status-details' + (is_reverse ? ' status-details-reverse' : '')" :style="'width: ' + detailTextWidth + '%; left: -' + detailTextWidth + '%'">
            <div class="p-div">
              <h4>{{ $t(detailData.type + '/' + $store.getters.getNameWithDesc(detailData)) }}</h4>
              <p style="color: #555; font-size: 0.65vw;">{{ $t('Version: ') }}{{ detailData.version }}</p>
              <p>{{ $t(detailData.type + '/' + $store.getters.getNameWithDesc(detailData) + '/' + detailData.version) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="summons">
        <!-- <h3>Summons</h3> -->
        <div v-for="summon in playerTable.summons" :key="summon.id" @click="selectObject(summon.position)">
          <Summon :summon="summon" :select-class="selectObjectClass(summon)" />
        </div>
      </div>
      <div class="dice" @click="log_dice()">
        <div v-for="data in sortedColors" :class="disableDice(data.idx)" :key="data.idx" @click="selectDice(data.idx)">
          <div :class="'dice-select-border ' + selectDiceClass(data.idx)"></div>
          <img class="cost-img" :src="image_path('DICE', data.color)" :alt="data.color" @error="imgSrcError($event)" />
          <div :class="'cost-text cost-text-' + data.color.toLowerCase()">
            <span>●</span>
          </div>
          <img class="element-img" :src="image_path('ELEMENT', data.color)" :alt="data.color" @error="$event.target.style.display='none'" />
        </div>
      </div>
    </div>
    <div class="player-info">
      <div class="player-name">
        <img class="player-icon" :src="image_path('AVATAR', playerTable.player_name)" @error="$event.target.style.display='none'" />
      </div>

      <div class="round-ended-and-arcane">
        <div class="round-ended">
          <span v-if="playerTable.has_round_ended" style="font-weight: bolder; color:rgb(238, 105, 22)">{{ $t('Round has ended') }}</span>
          <span v-else>{{ $t('Round has not ended') }}</span>
        </div>
        <div class="arcane-legend">
          <img :src="image_path('DICE', 'ARCANE_' + (playerTable.arcane_legend ? 'FULL' : 'EMPTY'))" height="100%" @error="imgSrcError($event)" />
          <div :class="'text-arcane-' + (playerTable.arcane_legend ? 'full' : 'empty')">
            <span>●</span>
          </div>
        </div>
      </div>
      <div class="table-deck" v-if="show_table_deck">
        <!-- <h3>Table Deck</h3> -->
        <div v-for="card in playerTable.table_deck" :key="card.id">
          <Card :card="card" />
        </div>
      </div>
      <div class="table-deck" v-else>
        <div class="table-deck-back" :style="is_reverse ? 'transform: rotate(180deg)' : ''">
          <div v-if="playerTable.table_deck.length > 10" class="table-deck-back-1">
            <img :src="image_path('CARD', 'Unknown')" @error="$event.target.style.display='none'"/>
          </div>
          <div v-if="playerTable.table_deck.length > 0" class="table-deck-back-2">
            <img :src="image_path('CARD', 'Unknown')" @error="$event.target.style.display='none'"/>
          </div>
          <div v-if="playerTable.table_deck.length > 20" class="table-deck-back-3">
            <img :src="image_path('CARD', 'Unknown')" @error="$event.target.style.display='none'"/>
          </div>
        </div>
        <!-- {{ $tc('Table Deck: ', playerTable.table_deck.length) }} -->
        <div :class="'table-deck-pdiv' + (is_reverse ? '-reverse' : '')">
          <span>{{ playerTable.table_deck.length }}</span>
        </div>
      </div>

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
import Character from './Character.vue'
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
        && 'player_icon' in value && 'active_character_idx' in value
        && 'has_round_ended' in value && 'dice' in value && 'team_status' in value
        && 'characters' in value && 'summons' in value && 'supports' in value
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
      detailTextWidth: 150,
      dataAttribute: '',
    }
  },
  components: {
    Character,
    Summon,
    Card,
    Support
  },
  mounted() {
    this.dataAttribute = this.$el.dataset;
  },
  methods: {
    imgSrcError(event) {
      event.target.style.display = 'none';

      let nextElement = event.target.nextElementSibling;
      if (nextElement) {
        nextElement.style.display = 'flex';
      }
    },
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
      let request = this.$store.state.requests[this.$store.state.selectedRequest];
      // request is selected, if request is use skill, show all card normally.
      // TODO can we show by diff?
      if (request.name == 'UseSkillRequest' || request.name == 'DeclareRoundEndRequest') {
        return 'select-none';
      }
      // request is selected, if card is corresponding request, select it.
      // otherwise, disable.
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
    selectObjectClass(object) {
      let object_position = object.position;
      if (this.$store.state.damageNotify && this.$store.state.damageNotify.position) {
        // has damage notify, if this is the position, show it
        if (this.$store.state.damageNotify.position.id == object_position.id) {
          this.$store.commit('setSelectedObject', object);
          return 'select-selected';
        }
      }
      if (this.$store.state.selectedRequest == null) {
        // request not selected, none
        return 'select-none';
      }
      let request = this.$store.state.requests[this.$store.state.selectedRequest];
      // request is selected, if request is use skill, show normally.
      // TODO can we show by diff?
      if (request.name == 'UseSkillRequest' || request.name == 'DeclareRoundEndRequest') {
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
    selectCharacterClass(object) {
      let object_position = object.position;
      let cidx = object_position.character_idx;
      if (this.$store.state.damageNotify && this.$store.state.damageNotify.position) {
        // has damage notify, if this is the position, show it
        if (this.$store.state.damageNotify.position.player_idx == this.playerTable.player_idx
            && this.$store.state.damageNotify.position.character_idx == cidx) {
          return 'select-selected';
        }
      }
      if (this.$store.state.selectedRequest == null) {
        // not selected, if contain switch character, can select
        let requests = this.$store.state.requests;
        for (let rid = 0; rid < requests.length; rid++) {
          let request = requests[rid];
          if (request.name != 'SwitchCharacterRequest') continue;
          if (request.target_character_idx == cidx && request.player_idx == this.playerTable.player_idx)
            return 'select-highlight';
        }
        return 'select-none';
      }
      let request = this.$store.state.requests[this.$store.state.selectedRequest];
      // request is selected, if request is use skill, show normally.
      // TODO can we show by diff?
      if (request.name == 'UseSkillRequest' || request.name == 'DeclareRoundEndRequest') {
        return 'select-none';
      }
      // if is SwitchCharacterRequest, show target
      if (request.name == 'SwitchCharacterRequest') {
        if (request.target_character_idx == cidx && request.player_idx == this.playerTable.player_idx)
          return 'select-selected';
        else
          return 'select-disabled';
      }
      return this.selectObjectClass(object);
    },
    selectCharacter(object_position) {
      let cidx = object_position.character_idx;
      if (this.$store.state.selectedRequest == null) {
        // not selected, if contains switch character, select
        let requests = this.$store.state.requests;
        for (let rid = 0; rid < requests.length; rid++) {
          let request = requests[rid];
          if (request.name != 'SwitchCharacterRequest') continue;
          if (!(request.target_character_idx == cidx && request.player_idx == this.playerTable.player_idx))
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
        // not this player
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
        return;
      }
      if (this.$store.state.requests[this.$store.state.selectedRequest].player_idx != this.playerTable.player_idx) {
        // not this player
        return;
      }
      this.$store.commit('diceClick', dice_idx)
    },
    costDefaultSelector() {
      let dice_rule = this.$store.state.diceSelectionRule;
      if (dice_rule.player != this.playerTable.player_idx)
        return;
      if (dice_rule == null || dice_rule.mode == 'none')
        return;
      let sorted = this.sortedColors;
      if (dice_rule.mode == 'any') {
        // reroll-dice will be any. select dice that color not right
        let c_colors = ['OMNI'];
        for (let i = 0; i < this.playerTable.characters.length; i ++ ) {
          let character = this.playerTable.characters[i];
          if (!character.is_alive) continue;
          c_colors.push(character.element);
          if (character.name == 'Maguu Kenki')
            c_colors.push('CRYO')
        }
        // click all wrong color dice
        for (let cid = 0; cid < sorted.length; cid++) {
          let color = sorted[cid].color;
          if (c_colors.indexOf(color) == -1) {
            this.$store.commit('diceClick', sorted[cid].idx);
          }
        }
        return;
      }
      if (dice_rule.mode == 'tune') {
        // click last
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
        for (let i = 0; i < this.playerTable.characters.length; i ++ ) {
          let character = this.playerTable.characters[i];
          main_color.add(character.element);
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
    disableDice(idx) {
      if (this.$store.state.selectedRequest == null) {
        // request not selected
        return 'select-none';
      }
      let req = this.$store.state.requests[this.$store.state.selectedRequest];
      if (req == undefined) return 'select-none';
      if (this.$store.state.requests[this.$store.state.selectedRequest].player_idx != this.playerTable.player_idx) {
        // not this player
        return 'select-dice-disabled';
      }
      if (req.name == 'ElementalTuningRequest') {
        if (req.dice_idxs && req.dice_idxs.indexOf(idx) == -1)
          return 'select-dice-disabled';
      }
      return 'select-none';
    },
    status_path(status) {
      let name = status.name;
      let desc = status.desc;
      if (status.icon_type != 'OTHERS') {
        name = status.icon_type;
        desc = '';
      }
      return this.$store.getters.getImagePath({
        type: 'TEAM_STATUS',
        name: name,
        desc: desc
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
      // omni always first
      let order = ['OMNI'];
      // active first, then alive standby
      let active = this.playerTable.active_character_idx;
      let cnum = this.playerTable.characters.length;
      if (active == -1) active = 0;
      for (let cid = -1; cid < cnum; cid++) {
        let character = this.playerTable.characters[cid];
        if (cid == -1) character = this.playerTable.characters[active];
        if (!character.is_alive) continue;
        order.push(character.element);
        if (character.name == 'Maguu Kenki')
          order.push('CRYO')
      }
      let result = [];
      // fill known
      let table_colors = this.playerTable.dice.colors;
      for (let cid = 0; cid < order.length; cid++) {
        let color = order[cid];
        if (order.indexOf(color) != cid) continue;
        for (let did = 0; did < table_colors.length; did++) {
          if (table_colors[did] == color)
            result.push({ idx: did, color: color });
        }
      }
      // collect unknown and count color number
      let others = [];
      let ocmap = {};
      for (let did = 0; did < table_colors.length; did++) {
        let color = this.playerTable.dice.colors[did];
        if (ocmap[color] == undefined) ocmap[color] = 0;
        ocmap[color] += 1;
        if (!order.includes(color))
          others.push({ idx: did, color: color });
      }
      // sort unknown by color number, large first
      others.sort((a, b) => {
        return ocmap[b.color] - ocmap[a.color];
      });
      // concat
      return result.concat(others);
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
              character_idx: pposition.character_idx,
              character_name: this.playerTable.characters[pposition.character_idx].name,
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
  font-size: 1vw;
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
  padding: 1vw 0;
}

.arcane-legend {
  position: relative;
  height: 50%;
  display: flex;
  justify-content: center;
}

.table-deck {
  position: relative;
  flex-direction: row;
  align-items: center;
  height: 100%;
}

.table-deck-back {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.table-deck-back > div {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: absolute;
}

.table-deck-back-1 > img {
  transform: rotate(10deg);
}
.table-deck-back-2 > img {
  transform: rotate(0deg);
}
.table-deck-back-3 > img {
  transform: rotate(-10deg);
}

.table-deck-back > div > img {
  height: 100%;
  top: 20%;
  left: 20%;
  position: relative;
  transform-origin: 50% 100%;
}

.table-deck-pdiv, .table-deck-pdiv-reverse {
  position: absolute;
  width: 60%;
  height: 60%;
  top: 30%;
  left: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2vw;
  color: white;
  font-weight: bolder;
  -webkit-text-stroke-width: 0.0625vw;
  -webkit-text-stroke-color: black;
  background: radial-gradient(circle, #FFF8, #FFF0);
  border-width: 20%;
  border-radius: 50%;
}

.table-deck-pdiv-reverse {
  top: 0;
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
  width: 7.34531%;
  height: 100%;
}

.supports-characters-summons {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: flex-start;
  height: 67%;
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

.characters {
  display: flex;
  flex-direction: row;
  justify-content:space-around;
  width: 60%;
  height: 100%;
}

.characters > * {
  width: 13.5%;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.characters > * > .team-status {
  height: 8.64%;
}

.characters > * > .active-div {
  height: 8.64%;
}

.characters > * > .character-inner {
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
  width: 44.4444444444%;
  height: 50%;
  margin: 0 2.77777777%;
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
  font-size: 0.75vw;
  font-weight: bolder;
  text-align: center;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  -webkit-text-stroke-width: 0.05vw;
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
  box-shadow: 0 0 0.25vw 0.25vw rgb(192, 192, 192);
  opacity: 0.2;
}

.select-highlight {
  box-shadow: 0 0 0.25vw 0.25vw rgb(255, 174, 0);
}

.select-selected {
  box-shadow: 0 0 0.25vw 0.25vw rgb(255, 81, 0);
}

.select-dice-none {
  border-radius: 50%;
}

.select-dice-selected {
  border-radius: 50%;
  box-shadow: 0 0 0.3vw 0.3vw rgb(255, 81, 0);
}

.select-dice-disabled {
  border-radius: 5%;
  /* box-shadow: 0 0 0.25vw 0.25vw rgb(192, 192, 192); */
  opacity: 0.2;
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
  top: 8.64%;
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

.status-details-reverse {
  top: 17.28%;
}

.status-details > .p-div {
  width: 150%;
  color: black;
  background-color: rgba(255, 255, 255, 0.5);
}

.p-div > * {
  margin-top: 0;
}

.p-div > h4 {
  margin: 0;
}

.cost-text {
  width: 100%;
  height: 100%;
  display: none;
  justify-content: center;
  align-items: center;
  font-size: 1.75vw;
}

.cost-text > span {
  transform: translateY(-0.15vw);
}

.cost-text-anemo {
  color: #54F0C0;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #30776E;
}

.cost-text-hydro {
  color: #52D3FF;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #4161A6;
}

.cost-text-pyro {
  color: #FF955F;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #9B4838;
}

.cost-text-cryo {
  color: #98E4E4;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #337683;
}

.cost-text-electro {
  color: #D19AFF;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #6A3EB3;
}

.cost-text-geo {
  color: #EACE5B;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #7C5D2F;
}

.cost-text-dendro {
  color: #BEDD76;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #647E31;
}

.cost-text-omni {
  color: #DDD5C4;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #9C917C;
}

.cost-text-unknown {
  color: #654F37;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #4E3D2C;
}

.text-arcane-full {
  font-size: 5vw;
  transform: translateY(-2vw);
  color: #E4ACF0;
  -webkit-text-stroke-width: 0.25vw;
  -webkit-text-stroke-color: #957D65;
}

.text-arcane-full, .text-arcane-empty {
  display: none;
}

.status-text {
  display: none;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  font-size: 2vw;
  font-weight: bold;
  -webkit-text-stroke-width: 0.15vw;
  transform: translate(-.0vw, -.1vw);
}

.status-text-debuff, .status-text-frozen, .status-text-daze, .status-text-dot,
.status-text-debuff_element_fire, .status-text-debuff_element_elec, .status-text-debuff_element_ice,
.status-text-debuff_element_water, .status-text-debuff_element_wind, .status-text-debuff_element_rock,
.status-text-debuff_element_grass, .status-text-debuff_element_physics, .status-text-food {
  color: #F28282;
  -webkit-text-stroke-color: #C26363;
}

.status-text-buff, .status-text-special, .status-text-atk_self, .status-text-atk_up {
  color: #B87A53;
  -webkit-text-stroke-color: #FFBD84;
}

.status-text-atk_up_wind, .status-text-element_enchant_wind {
  color: #54F0C0;
  -webkit-text-stroke-color: #30776E;
}

.status-text-atk_up_water, .status-text-element_enchant_water {
  color: #52D3FF;
  -webkit-text-stroke-color: #4161A6;
}

.status-text-atk_up_fire, .status-text-element_enchant_fire {
  color: #FF955F;
  -webkit-text-stroke-color: #9B4838;
}

.status-text-atk_up_ice, .status-text-element_enchant_ice {
  color: #98E4E4;
  -webkit-text-stroke-color: #337683;
}

.status-text-atk_up_elec, .status-text-element_enchant_elec {
  color: #D19AFF;
  -webkit-text-stroke-color: #6A3EB3;
}

.status-text-atk_up_rock, .status-text-element_enchant_rock {
  color: #EACE5B;
  -webkit-text-stroke-color: #7C5D2F;
}

.status-text-atk_up_grass, .status-text-element_enchant_grass {
  color: #BEDD76;
  -webkit-text-stroke-color: #647E31;
}

.status-text-barrier {
  color: #965CDD;
  -webkit-text-stroke-color: #B490E0;
}

.status-text-shield {
  color: #E5C58B;
  -webkit-text-stroke-color: #AD9055;
}

.status-text-heal, .status-text-revive {
  color: #A4F482;
  -webkit-text-stroke-color: #527C2F;
}

.status-text-others {
  color: #888;
  -webkit-text-stroke-width: 0;
  font-size: 1.5vw;
}

</style>
