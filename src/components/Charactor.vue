<template>
  <div @click.stop="log_data">
    <div class="elements">
      <div class="element" v-for="(element, eid) in charactor.element_application" :key="eid">
        <img :src="'static/images/ELEMENT_' + element + '.png'" width="100%" height="100%">
      </div>
    </div>
    <div :class="charactor.is_alive ? 'charactor' : 'charactor-died'">
      <img class="charactor-image" :src="image_path">
      <!-- <div class="charactor-name">{{ charactor.name }}</div> -->
      <div class="charactor-hp">{{ charactor.hp }}</div>
      <div class="charactor-charge">
        <span v-for="i in charactor.max_charge" :key="i"
          :style="{ color: i <= charactor.charge ? 'yellow' : 'grey' }">&#x25CF;</span>
      </div>
      <div v-if="charactor.weapon" @click.stop="log_object(charactor.weapon)" @mouseover="showDetails(charactor.weapon)" @mouseout="hideDetails()" class="charactor-weapon">Weapon: {{ charactor.weapon }}</div>
      <div v-if="charactor.artifact" @click.stop="log_object(charactor.artifact)" @mouseover="showDetails(charactor.artifact)" @mouseout="hideDetails()" class="charactor-artifact">
        <img src="static/images/EQUIP_Artifact.png" width="100%" height="100%" />
      </div>
      <div v-if="charactor.talent" @click.stop="log_object(charactor.talent)" @mouseover="showDetails(charactor.talent)" @mouseout="hideDetails()" class="charactor-talent">Talent: {{ charactor.talent }}</div>
      <div v-if="showDetailsFlag" class="charactor-details">
        <p>{{  detailData }}</p>
        <div class="detail-img-div">
          <img :src="'static/images/' + detailData.name + '.png'" width="100%" height="100%" />
        </div>
      </div>
      <div class="charactor-status-div">
        <div v-for="(status, sid) in charactor.status" :key="sid" @click.stop="log_object(status)">
          <img :src="'static/images/CharactorStatus_' + status.name + '.png'" width="100%" height="100%" />
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
  name: 'Charactor',
  props: {
    charactor: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showDetailsFlag: false,
      detailData: null,
    }
  },
  methods: {
    log_data() {
      console.log(JSON.parse(JSON.stringify(this.charactor)));
    },
    log_object(obj) {
      console.log(JSON.parse(JSON.stringify(obj)));
    },
    showDetails(data) {
      this.showDetailsFlag = true;
      this.detailData = data;
    },
    hideDetails() {
      this.showDetailsFlag = false;
    }
  },
  computed: {
    image_path() {
      let name = this.charactor.name.replace('MobMage', 'Mob Mage');
      name = name.replace('Mob', ' Mob');
      return 'static/images/' + name + '.png';
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
}

.charactor, .charactor-died {
  position: relative;
  width: 100%;
  height: 89.56%;
  /* top: 10.44%; */
  /* text-shadow: 2px 2px 0px  #fff, -2px -2px 0px  #fff, 2px -2px 0px  #fff, -2px 2px 0px  #fff; */
  color: black;
  font-weight: bolder;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: white;
  font-size: 2vw;
}

.charactor-died {
  border: 1px solid red;
  background-color: red;
}

.charactor-died > * {
  opacity: 0.8;
}

.charactor > div, .charactor-died > div {
  /* Add styles for all the div elements inside the charactor container */
  position: absolute;
}

.charactor-image {
  /* Add styles for the charactor image */
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.charactor-name {
  /* Add styles for the charactor name div */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.charactor-hp {
  /* Add styles for the charactor hp div */
  height: 20%;
  width: 20%;
}

.charactor-charge {
  /* Add styles for the charactor charge div */
  display: flex;
  flex-direction: column;
  width: 20%;
  height: 100%;
  left: 80%;
  align-items: end;
}

.charactor-weapon {
  /* Add styles for the charactor weapon div */
  top: 20%;
  height: 20%;
  width: 34%;
}

.charactor-artifact {
  /* Add styles for the charactor artifact div */
  top: 40%;
  height: 20%;
  width: 34%;
}

.charactor-talent {
  /* Add styles for the charactor talent div */
  top: 60%;
  height: 20%;
  width: 34%;
}

.charactor-status-div {
  /* Add styles for the charactor status div */
  display: flex;
  flex-direction: row;
  top: 88.34%;
  height: 11.66%;
  width: 100%;
}

.charactor-status-div > div {
  position: relative;
  /* width: 10%;
  height: 10%; */
  width: 20%;
  height: 100%;
}

.charactor-status-div img {
  position: absolute;
}

.charactor-details {
  position: absolute;
  top: 0;
  left: -200%;
  width: 200%;
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

.charactor-details > .detail-img-div {
  width: 50%;
}

.charactor-details > p {
  width: 150%;
  color: black;
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

</style>
