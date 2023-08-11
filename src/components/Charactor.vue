<template>
  <div>
    <div class="elements">
      <div class="element" v-for="element in charactor.element_application">
        {{ element }}
      </div>
    </div>
    <div :class="charactor.is_alive ? 'charactor' : 'charactor-died'">
      <div class="charactor-name">{{ charactor.name }}</div>
      <div class="charactor-hp">{{ charactor.hp }}</div>
      <div class="charactor-charge">
        <span v-for="i in charactor.max_charge" :key="i"
          :style="{ color: i <= charactor.charge ? 'yellow' : 'grey' }">&#x25CF;</span>
      </div>
      <div v-if="charactor.weapon" class="charactor-weapon">Weapon: {{ charactor.weapon }}</div>
      <div v-if="charactor.artifact" class="charactor-artifact">Artifact: {{ charactor.artifact }}</div>
      <div v-if="charactor.talent" class="charactor-talent">Talent: {{ charactor.talent }}</div>
      <div class="charactor-status">Status: {{ charactor.status }}</div>
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
  }
}
</script>

<style scoped>
.elements {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 10.44%;
}
.charactor, .charactor-died {
  position: relative;
  width: 100%;
  height: 89.56%;
  /* top: 10.44%; */
}

.charactor-died {
  border: 1px solid red;
}

.charactor > div, .charactor-died > div {
  /* Add styles for all the div elements inside the charactor container */
  position: absolute;
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
}

.charactor-artifact {
  /* Add styles for the charactor artifact div */
  top: 40%;
  height: 20%;
}

.charactor-talent {
  /* Add styles for the charactor talent div */
  top: 60%;
  height: 20%;
}

.charactor-status {
  /* Add styles for the charactor status div */
  top: 88.34%;
  height: 11.66%;
  width: 100%;
}
</style>
