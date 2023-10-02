import Vue from 'vue';
import Vuex from 'vuex';
import nameMap from './consts';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    /* data selection variables */
    match: null,
    requests: [],
    selectedRequest: null,
    positions: [],
    selectedPositions: [],
    diceSelectionRule: {},
    selectedDice: [],
    commandString: '',
    selectedObject: null,
  },
  mutations: {
    setSelectedObject(state, obj) {
      state.selectedObject = obj;
    },
    setMatch(state, match) {
      // when new match set, clear selected and update requests
      state.match = match;
      state.requests = match.requests;
      let request = null;
      if (state.requests.length > 0) {
        let filtered = state.requests.filter((r) => {
          return r.player_idx == state.requests[0].player_idx
        })
        if (filtered.length == 1) request = 0;
      }
      this.commit('selectRequest', request);
    },
    selectRequest(state, request_idx) {
      // when a request selected, update positions
      state.selectedRequest = request_idx;
      state.positions = [];
      state.selectedPositions = [];
      this.commit('updateCost', { mode: 'none' });
      state.commandString = '';
      if (request_idx === null) {
        return
      }
      let request = state.requests[request_idx];
      let player_idx = request.player_idx;
      let table = state.match.player_tables[player_idx];
      if (request.name == 'SwitchCardRequest') {
        // all hand cards are valid positions
        let hands = table.hands
        for (let i = 0; i < hands.length; i++) {
          state.positions.push(hands[i].position)
        }
      }
      else if (request.name == 'ChooseCharactorRequest') {
        // all charactors listed in available_charactor_idxs are valid positions
        let charactors = table.charactors
        console.log(charactors, request)
        for (let i = 0; i < request.available_charactor_idxs.length; i++) {
          state.positions.push(charactors[request.available_charactor_idxs[i]].position)
        }
      }
      else if (request.name == 'RerollDiceRequest') {
        // all dice are available, no other positions
        this.commit('updateCost', { mode: 'any', player: player_idx })
      }
      else if (request.name == 'SwitchCharactorRequest') {
        // charactors listed in candidate_charactor_idxs are valid positions
        let charactors = table.charactors
        state.positions.push(charactors[request.target_charactor_idx].position)
        state.selectedPositions.push(0);
      }
      else if (request.name == 'ElementalTuningRequest') {
        // all hand cards are valid positions
        let hands = table.hands
        for (let i = 0; i < hands.length; i++) {
          state.positions.push(hands[i].position)
        }
        this.commit('updateCost', { mode: 'tune', player: player_idx })
      }
      else if (request.name == 'DeclareRoundEndRequest') {
        // no other positions
      }
      else if (request.name == 'UseSkillRequest') {
        // opponent active charactor as position
        let o_table = state.match.player_tables[1 - player_idx]
        let o_charactors = o_table.charactors
        let active = o_table.active_charactor_idx
        state.positions.push(o_charactors[active].position)
        state.selectedPositions = [0]
      }
      else if (request.name == 'UseCardRequest') {
        // get target positions from request directly
        state.positions = request.targets
      }
      if (state.positions.length == 1) state.selectedPositions = [0];
      if (request.cost != undefined) {
        // has cost, update dice selection
        this.commit('updateCost',  { mode: 'cost', player: player_idx, cost: request.cost })
      }
      this.commit('updateCommandString');
    },
    updateCost(state, rule) {
      state.diceSelectionRule = rule;
      state.selectedDice = [];
    },
    diceClick(state, data) {
      data = { idx: data };
      if (state.diceSelectionRule.mode == 'none') {
        return
      }
      let table = state.match.player_tables[state.diceSelectionRule.player]
      if (state.diceSelectionRule.mode == 'any') {
        // if in selected, remove; if not, add
        let idx = state.selectedDice.indexOf(data.idx)
        if (idx == -1) {
          state.selectedDice.push(data.idx)
        }
        else {
          state.selectedDice.splice(idx, 1)
        }
      }
      else if (state.diceSelectionRule.mode == 'tune') {
        // can only select one die with different element as active charactor
        let active = table.active_charactor_idx
        let element = table.charactors[active].element
        let dice_color = table.dice.colors[data.idx]
        console.log(element, dice_color)
        if (dice_color == element || dice_color == 'OMNI') {
          return
        }
        // keep only one die
        state.selectedDice = [data.idx]
      }
      else if (state.diceSelectionRule.mode == 'cost') {
        function costValidCheck(cost, color, selected) {
          // based on cost, check current selected with color is valid
          let total = cost.any_dice_number + cost.same_dice_number + cost.elemental_dice_number
          // select number should not exceed total
          if (selected.length > total) return false;
          if (cost.same_dice_number > 0) {
            // for same, ignore OMNI should only contain one color
            let selected_color = null;
            for (let i = 0; i < selected.length; i++) {
              let c = color[selected[i]]
              if (c == 'OMNI') continue;
              if (selected_color != null && selected_color != c) return false;
              selected_color = c;
            }
            return true;
          }
          let ele_number = cost.elemental_dice_number;
          let filtered = 0;
          for (let i = 0; i < selected.length; i++) {
            // fulfill elemental dice number first
            let c = color[selected[i]]
            if (ele_number > 0 && (c == 'OMNI' || c == cost.elemental_dice_color)) {
              ele_number -= 1;
            }
            else {
              filtered++;
            }
          }
          // other number should smaller than any
          return filtered <= cost.any_dice_number;
        }
        let idx = state.selectedDice.indexOf(data.idx)
        if (idx != -1) {
          // if is selected, remove and return
          state.selectedDice.splice(idx, 1);
        }
        else {
          // otherwise, check if valid
          state.selectedDice.push(data.idx);
          if (!costValidCheck(state.diceSelectionRule.cost, table.dice.colors, state.selectedDice)) {
            state.selectedDice = [data.idx];
            if (!costValidCheck(state.diceSelectionRule.cost, table.dice.colors, state.selectedDice)) {
              state.selectedDice = [];
            }
          }
        }
      }
      this.commit('updateCommandString');
    },
    positionClick(state, position_idx) {
      console.log(position_idx, state.selectedPositions)
      if (state.selectedRequest == null) return;
      if (position_idx == null || position_idx == -1) return;
      let select_idx = state.selectedPositions.indexOf(position_idx);
      if (state.requests[state.selectedRequest].name == 'SwitchCardRequest') {
        // only this request can select multiple positions
        if (select_idx == -1) {
          state.selectedPositions.push(position_idx)
        }
        else {
          state.selectedPositions.splice(select_idx, 1)
        }
      }
      else {
        // other request can only select one position
        state.selectedPositions = [position_idx]
      }
      console.log(position_idx, state.selectedPositions)
      this.commit('updateCommandString');
    },
    updateCommandString(state) {
      state.commandString = '';
      if (state.selectedRequest == null) return;
      if (state.diceSelectionRule.mode != 'none'
        && state.diceSelectionRule.mode != 'any') {
          // need dice number right
          let cost = state.diceSelectionRule.cost;
          let total = 1;
          if (state.diceSelectionRule.mode != 'tune')
            total = cost.any_dice_number + cost.same_dice_number + cost.elemental_dice_number
          // select number should not exceed total
          if (state.selectedDice.length != total) return;
        }
      let request = state.requests[state.selectedRequest];
      let res = {
        'SwitchCardRequest': 'sw_card',
        'ChooseCharactorRequest': 'choose',
        'RerollDiceRequest': 'reroll',
        'SwitchCharactorRequest': 'sw_char',
        'ElementalTuningRequest': 'tune',
        'DeclareRoundEndRequest': 'end',
        'UseSkillRequest': 'skill',
        'UseCardRequest': 'card',
      }[request.name] + ' ';
      if (res == 'sw_card ') {
        for (let i = 0; i < state.selectedPositions.length; i++) {
          let position = state.positions[state.selectedPositions[i]];
          let hands = state.match.player_tables[request.player_idx].hands;
          for (let j = 0; j < hands.length; j++) {
            if (hands[j].position.id == position.id) {
              res += j + ' ';
              break;
            }
          }
        }
      }
      else if (res == 'choose ') {
        if (state.selectedPositions.length != 1) return;
        let position = state.positions[state.selectedPositions[0]];
        let charactors = state.match.player_tables[request.player_idx].charactors;
        for (let j = 0; j < charactors.length; j++) {
          if (charactors[j].position.id == position.id) {
            res += j + ' ';
            break;
          }
        }
      }
      else if (res == 'reroll ') {
        res += state.selectedDice.join(' ') + ' ';
      }
      else if (res == 'sw_char ') {
        if (state.selectedPositions.length != 1) return;
        let position = state.positions[state.selectedPositions[0]];
        let charactors = state.match.player_tables[request.player_idx].charactors;
        for (let j = 0; j < charactors.length; j++) {
          if (charactors[j].position.id == position.id) {
            res += j + ' ';
            break;
          }
        }
        res += state.selectedDice.join(' ') + ' ';
      }
      else if (res == 'tune ') {
        if (state.selectedPositions.length != 1) return;
        let position = state.positions[state.selectedPositions[0]];
        let hands = state.match.player_tables[request.player_idx].hands;
        for (let j = 0; j < hands.length; j++) {
          if (hands[j].position.id == position.id) {
            res += j + ' ';
            break;
          }
        }
        res += state.selectedDice.join(' ') + ' ';
      }
      else if (res == 'end ') {
        // no other positions
      }
      else if (res == 'skill ') {
        res += request.skill_idx + ' ';
        res += state.selectedDice.join(' ') + ' ';
      }
      else if (res == 'card ') {
        res += request.card_idx + ' ';
        if (state.selectedPositions.length > 1) return;
        if (state.selectedPositions.length == 0 && state.positions.length > 0) return;
        if (state.selectedPositions.length == 1) {
          let position = state.positions[state.selectedPositions[0]];
          if (position.positions) {
            // multiple position selection
            res += state.selectedPositions[0] + ' ';
          }
          else for (let i = 0; i < request.targets.length; i++) {
            if (request.targets[i].id == position.id) {
              res += i + ' ';
              break;
            }
          }
        }
        else res += '0 ';
        res += state.selectedDice.join(' ') + ' ';
      }
      state.commandString = res;
      // console.log(res)
    },
  },
  getters: {
    getImagePath: (state) => (payload) => {
      let type = payload.type;
      let name = payload.name;
      let res = nameMap[type + '/' + name];

      if (type == 'avatar') {
        res = nameMap['charactor/' + name];
        if (res == undefined) return;
        return 'static/images/' + res.replace(/cardface\/Char_(Avatar|Enemy|Monster)_/, 'avatar/')
      }

      if ((type == 'charactor_status' || type == 'team_status') && res == undefined) {
        let name_arr = name.toLowerCase().split('_');
        let res_name = [];
        for (let i = 0; i < name_arr.length; i++) {
          res_name.push(name_arr[i].charAt(0).toUpperCase() + name_arr[i].slice(1).toLowerCase());
        }
        res_name = res_name.join('_');
        if (res_name.slice(0, 7) != 'Element')
          res_name = 'Common_' + res_name;
        return 'static/images/status/' + res_name + '.png';
      }

      if (type == 'support') res = nameMap['card/' + name]
      if (type == 'summon' || type == 'support') {
        res = res.replace('cardface', 'small_card')
      }
      if (res == undefined) return;
      return 'static/images/' + res;
    }
  },
});
