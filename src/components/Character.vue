<template>
  <div @click="log_data">
    <div class="elements">
      <div class="element" v-for="(element, eid) in character.element_application" :key="eid">
        <img :src="image_path('ELEMENT', element)" width="100%" height="100%" @error="imgSrcError($event)">
        <div :class="'element-text element-text-' + element.toLowerCase()">
          <span>●</span>
        </div>
      </div>
    </div>
    <div :class="(character.is_alive ? 'character ' : 'character-died ') + selectClass">
      <img
        class="character-image"
        :src="image_path('CHARACTER', character.name, character.desc)"
        :alt="$t('CHARACTER/' + character.name + (character.desc.length > 0 ? '_' : '') + character.desc)"
        @error="imgSrcError($event)"
      />
      <div class="character-text">
        <span>{{ $t('CHARACTER/' + character.name + (character.desc.length > 0 ? '_' : '') + character.desc) }}</span>
      </div>
      <div class="character-hp">
        <div>
          <img :src="image_path('ICON', 'HP')" width="100%" heright="100%" @error="$event.target.style.display='none'"/>
          <div class="hp-span-div">
            <span :style="character.hp > 9 ? 'padding-right: 0.2vw;' : ''">{{ character.hp }}</span>
          </div>
        </div>
      </div>
      <div class="character-charge-back">
        <div v-for="i in character.max_charge" :key="i">
          <img :src="image_path('ICON', 'CHARGE_BACK')" width="100%" height="100%" @error="imgSrcError($event)" />
          <div class="charge-text-back">
            <span>●</span>
          </div>
        </div>
      </div>
      <div class="character-charge-front">
        <div v-for="i in character.charge" :key="i">
          <img :src="image_path('ICON', 'CHARGE_FRONT')" width="100%" height="100%" @error="imgSrcError($event)" />
          <div class="charge-text-front">
            <span>●</span>
          </div>
        </div>
      </div>
      <div v-if="character.weapon" @click="log_object(character.weapon)" @mouseover="showDetails(character.weapon)" @mouseout="hideDetails()" class="character-weapon">
        <img :src="image_path('ICON', 'EQUIP_WEAPON')" width="100%" height="100%" @error="imgSrcError($event)"/>
        <div class="equip-text">
          <span>{{ $t('Equip Weapon Text') }}</span>
        </div>
      </div>
      <div v-if="character.artifact" @click="log_object(character.artifact)" @mouseover="showDetails(character.artifact)" @mouseout="hideDetails()" class="character-artifact">
        <img :src="image_path('ICON', 'EQUIP_ARTIFACT')" width="100%" height="100%" @error="imgSrcError($event)"/>
        <div class="equip-text">
          <span>{{ $t('Equip Artifact Text') }}</span>
        </div>
      </div>
      <div v-if="character.talent" @click="log_object(character.talent)" @mouseover="showDetails(character.talent)" @mouseout="hideDetails()" class="character-talent">
        <img :src="image_path('ICON', 'EQUIP_TALENT')" width="100%" height="100%" @error="imgSrcError($event)"/>
        <div class="equip-text">
          <span>{{ $t('Equip Talent Text') }}</span>
        </div>
      </div>
      <div v-if="showDetailsFlag" class="character-details" :style="detailDivStyle(detailData)">
        <div class="p-div" :style="'width: ' + detailTextWidth + '%'">
          <h4>{{ $t(detailData.type + '/' + $store.getters.getNameWithDesc(detailData)) }}</h4>
          <p style="color: #555; font-size: 0.65vw;">{{ $t('Version: ') }}{{ detailData.version }}</p>
          <p>{{ $t(detailData.type + '/' + $store.getters.getNameWithDesc(detailData) + '/' + detailData.version) }}</p>
          <!-- <p>Usage: {{ detailData.usage }}</p> -->
        </div>
        <div class="detail-img-div" v-if="detailData.img_name" :style="'width: ' + detailImgWidth + '%'">
          <img :src="image_path(detailData.type, detailData.img_name, detailData.desc)" width="100%" height="100%" @error="$event.target.style.display='none'"/>
        </div>
      </div>
      <div class="damage-notify-div" v-if="damage_notify.length > 0">
        <p v-for="(notify, nid) in damage_notify" :key="nid" :style="{ color: notify.color, 'font-size': notify.font_size }">{{ notify.damage }}</p>
      </div>
      <div class="character-status-div">
        <div v-for="(status, sid) in character.status" :key="sid" @click="log_object(status)" @mouseover="showDetails(status, false)" @mouseout="hideDetails()" >
          <img :src="status_path(status)" width="100%" height="100%" @error="imgSrcError($event)" />
          <div :class="'status-text status-text-' + status.icon_type.toLowerCase()">
            <span>{{ status.icon_type == 'OTHERS' ? '?' : '●' }}</span>
          </div>
          <div class="usage-span-div">
            <span v-if="status.usage && status.usage > 0">{{ status.usage }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Character',
  props: {
    character: {
      type: Object,
      required: true
    },
    detailTextWidth: {
      type: Number,
      default: 175
    },
    selectClass: {
      type: String,
      default: 'select-none'
    }
  },
  data() {
    return {
      showDetailsFlag: false,
      detailData: null,
      detailImgWidth: 50,
      detailOffset: 15,
    }
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
    replaceImgWithText(event, text, cls) {
      // replace obj with text, text will be wrapped in p in a div with class
      // cls, obj will be hidden.
      const newTextElement = document.createTextNode(text);
      const newSpanElement = document.createElement('span');
      newSpanElement.appendChild(newTextElement);
      const newDivElement = document.createElement('div');
      newDivElement.className = cls;
      newDivElement.appendChild(newSpanElement);
      for (let key in this.dataAttribute) {
        newDivElement.setAttribute(`data-${key}`, '');
        newSpanElement.setAttribute(`data-${key}`, '');
      }
      event.target.parentNode.replaceChild(newDivElement, event.target);
    },
    log_data() {
      console.log('CHARACTER', JSON.parse(JSON.stringify(this.character)));
      this.$store.commit('setSelectedObject', this.character)
    },
    log_object(obj) {
      console.log(obj.type, JSON.parse(JSON.stringify(obj)));
    },
    showDetails(data, img = true) {
      data = JSON.parse(JSON.stringify(data));
      this.showDetailsFlag = true;
      if (img) data.img_name = data.name;
      if (data.type == 'TALENT') {
        data.type = data.type + '_' + data.character_name;
      }
      this.detailData = data;
    },
    hideDetails() {
      this.showDetailsFlag = false;
    },
    status_path(status) {
      let name = status.name;
      let desc = status.desc;
      if (status.icon_type != 'OTHERS') {
        name = status.icon_type;
        desc = '';
      }
      return this.$store.getters.getImagePath({
        type: status.type,
        name: name,
        desc: desc
      })
    },
    image_path(type, name, desc) {
      return this.$store.getters.getImagePath({
        type: type,
        name: name,
        desc: desc
      })
    },
    detailDivStyle(detailData) {
      let text_width = this.detailTextWidth;
      let img_width = this.detailImgWidth;
      let offset = this.detailOffset;
      let width = 0;
      if (detailData.img_name) {
        width = text_width + img_width;
      }
      else {
        width = text_width;
      }
      let left = - width - offset;
      return 'width: ' + width + '%; left: ' + left + '%';
    }
  },
  computed: {
    damage_notify() {
      let notify = this.$store.state.damageNotify;
      if (notify && notify[this.character.position.player_idx]
          && notify[this.character.position.player_idx][this.character.position.character_idx]) {
        let res = [];
        for (let i = 0; i < notify[this.character.position.player_idx][this.character.position.character_idx].length; i++) {
          let item = notify[this.character.position.player_idx][this.character.position.character_idx][i];
          item = JSON.parse(JSON.stringify(item));
          if (item.type == 'HEAL') item.damage = '+' + item.damage;
          else item.damage = '-' + item.damage;
          let colors = {
            'PYRO': 'rgb(242, 121, 71)',
            'CRYO': 'rgb(111, 215, 225)',
            'HYDRO': 'rgb(95, 154, 227)',
            'ELECTRO': 'rgb(181, 123, 236)',
            'ANEMO': 'rgb(88, 220, 171)',
            'GEO': 'rgb(225, 169, 16)',
            'DENDRO': 'rgb(151, 200, 89)',
            'PHYSICAL': 'rgb(119, 106, 102)',
            'HEAL': 'rgb(80, 213, 103)',
            'PIERCING': 'rgb(119, 106, 102)',
          }
          item.color = colors[item.type];
          res.push(item);
        }
        let sizes = ['3vw', '3vw', '2.5vw', '2vw', '1.5vw', '1vw', '0.5vw'];
        let target_size = res.length;
        if (target_size > 6) target_size = 6;
        for (let i = 0; i < res.length; i++) {
          res[i].font_size = sizes[target_size];
        }
        return res;
      }
      return [];
    }
  }
}
</script>

<style scoped>
.elements {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 10.44%;
}

.element {
  height: 100%;
  width: 20%;
}

.character, .character-died {
  position: relative;
  width: 100%;
  height: 89.56%;
  /* top: 10.44%; */
  /* text-shadow: 2px 2px 0px  #fff, -2px -2px 0px  #fff, 2px -2px 0px  #fff, -2px 2px 0px  #fff; */
  color: black;
  font-size: 2vw;
}

.character-died {
  border: 1px solid red;
  background-color: red;
}

.character-died > * {
  opacity: 0.8;
}

.character > div, .character-died > div {
  /* Add styles for all the div elements inside the character container */
  position: absolute;
}

.character-image {
  /* Add styles for the character image */
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  font-size: 70%;
  -webkit-text-stroke-width: 0;
}

.character-name {
  /* Add styles for the character name div */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.character-hp {
  /* Add styles for the character hp div */
  position: absolute;
  top: -5%;
  left: -17%;
  height: 30%;
  width: 41.856%;
  opacity: 1;
  font-weight: bolder;
  -webkit-text-stroke-width: 0.05vw;
}

.character-hp > div {
  position: absolute;
  font-size: 1.7vw;
  font-weight: bolder;
  text-align: center;
  width: 100%;
  height: 100%;
  -webkit-text-stroke-color: black;
  /* line-height: 130%; */
  color: white;
  /* z-index: 999; */
  display: flex;
  justify-content: center;
  align-items: center;
}

.hp-span-div {
  position: absolute;
  left: 0;
  letter-spacing: -0.2vw;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.character-charge {
  /* Add styles for the character charge div */
  display: flex;
  flex-direction: column;
  width: 20%;
  height: 100%;
  left: 80%;
  align-items: end;
}

.character-charge-back {
  display: flex;
  flex-direction: column;
  width: 26.01%;
  height: 100%;
  left: 87%;
  opacity: 1;
}

.character-charge-back > div {
  height: 15.174%;
  width: 100%;
  margin-top: 0.25vw;
}

.character-charge-front > div > img {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.character-charge-front {
  display: flex;
  flex-direction: column;
  width: 40.81%;
  height: 100%;
  left: 79.6%;
  opacity: 1;
}

.character-charge-front > div {
  /* height: 19.62%; */
  position: relative;
  height: 15.174%;
  width: 100%;
  /* margin-top: 15%; */
  margin-top: 0.25vw;
}

.character-charge-front > div > img {
  position: absolute;
  height: 129.31%;
  /* top: -14.655%; */
}

.character-weapon {
  /* Add styles for the character weapon div */
  top: 25%;
  left: -15%;
  height: 20%;
  width: 36.2%;
}

.character-artifact {
  /* Add styles for the character artifact div */
  top: 45%;
  left: -15%;
  height: 20%;
  width: 36.2%;
}

.character-talent {
  /* Add styles for the character talent div */
  top: 65%;
  left: -15%;
  height: 20%;
  width: 36.2%;
}

.character-status-div {
  /* Add styles for the character status div */
  display: flex;
  flex-direction: row;
  top: 88.34%;
  height: 11.66%;
  width: 100%;
}

.character-status-div > div {
  position: relative;
  /* width: 10%;
  height: 10%; */
  width: 20%;
  height: 100%;
}

.character-status-div img {
  position: absolute;
}

.character-details {
  position: absolute;
  top: 0;
  height: 100%;
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

.character-details > .detail-img-div {
  width: 50%;
}

.character-details > .p-div {
  color: black;
  background-color: rgba(255, 255, 255, 0.5);
}

.p-div > * {
  margin-top: 0;
}

.p-div > h4 {
  margin: 0;
}

.usage-span-div {
  position: absolute;
  font-size: 0.75vw;
  font-weight: bolder;
  text-align: center;
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

.select-none, .select-disabled, .select-highlight, .select-selected {
  border-radius: 0.65vw;
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

.damage-notify-div {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.damage-notify-div > * {
  border-radius: 1000px;
  background-color: rgb(244, 239, 216);
  box-shadow: 0 0 0.25vw 0.25vw rgb(211, 179, 138);
  margin: 0.25vw;
  padding: 0.25vw;
}

.charge-text-back, .charge-text-front {
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 2vw;
  -webkit-text-stroke-width: 0.3vw;
}

.charge-text-front {
  color: #FFFFDF;
  -webkit-text-stroke-color: #EEA13B;
  transform: translateX(0.3vw);
}
.charge-text-back {
  color: #A68C73;
  -webkit-text-stroke-color: #917657;
  transform: translateX(0.3vw);
}

.character-text {
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 2vw;
  font-weight: bold;
  height: 100%;
  width: 100%;
  border: 0.1vw;
  border-color: #6B5531;
  border-style: solid;
  border-radius: 0.5vw;
  background-color: white;
}

.character-text > span {
  word-break: break-all;
}

.equip-text {
  display: none;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #FFFF, #FFF0);
  font-size: 2vw;
  font-weight: bold;
  height: 100%;
  width: 100%;
  border: 0.1vw;
}

.element-text {
  display: none;
  width: 100%;
  height: 100%;
  font-size: 2vw;
  transform: translate(-.0vw, -.75vw);
  -webkit-text-stroke-width: 0.25vw;
}

.element-text-anemo {
  color: #54F0C0;
  -webkit-text-stroke-color: #30776E;
}

.element-text-hydro {
  color: #52D3FF;
  -webkit-text-stroke-color: #4161A6;
}

.element-text-pyro {
  color: #FF955F;
  -webkit-text-stroke-color: #9B4838;
}

.element-text-cryo {
  color: #98E4E4;
  -webkit-text-stroke-color: #337683;
}

.element-text-electro {
  color: #D19AFF;
  -webkit-text-stroke-color: #6A3EB3;
}

.element-text-geo {
  color: #EACE5B;
  -webkit-text-stroke-color: #7C5D2F;
}

.element-text-dendro {
  color: #BEDD76;
  -webkit-text-stroke-color: #647E31;
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
  -webkit-text-stroke-color: #B87A53;
  color: #FFBD84;
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
