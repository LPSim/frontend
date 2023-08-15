<template>
  <div :class="{ 'card': true, 'active-card': card.is_active }" @click.stop="log_data">
    <img :src="'static/images/' + card.name + '.png'" alt="card.name" width="100%" height="100%" />
    <!-- <p>{{ card.name }}</p> -->
    <!-- <p>Cost: {{ card.cost }}</p> -->
    <div class="cost-div">
      <div v-for="(c, cid) in cost" :key="cid">
        <img :src="'static/images/COST_' + c.type + '.png'" alt="c.type" width="100%" height="100%" />
        <div class="cost-span-div">
          <span :class="{'cost-higher': c.is_higher, 'cost-lower': c.is_lower}">{{ c.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    card: {
      type: Object,
      required: true,
      validator: (value) => {
        return 'name' in value && 'cost' in value && 'is_active' in value
      }
    }
  },
  methods: {
    log_data() {
      console.log(JSON.parse(JSON.stringify(this.card)))
    }
  },
  computed: {
    cost() {
      return [
        { type: 'GEO', value: 2, is_higher: true, is_lower: false},
        { type: 'UNALIGNED', value: 1, is_higher: false, is_lower: true},
        { type: 'MATCHING', value: 3, is_higher: false, is_lower: false},
        { type: 'CHARGE', value: 2, is_higher: false, is_lower: false},
      ]
    }
  }
}
</script>

<style scoped>

.card {
  position: relative;
  width: 100%;
  height: 100%;
}

.active-card {
  border: 2px solid red;
}

img {
  position: absolute;
}

.cost-div {
  /* position: absolute; */
  display: flex;
  flex-direction: column;
  width: 38%;
  height: 100%;
}

.cost-div > div {
  position: relative;
  /* width: 10%;
  height: 10%; */
  width: 100%;
  height: 22.2%;
  margin-left: -10%;
  margin-top: -10%;
  margin-bottom: 10%;
  margin-right: 10%;
}

.cost-higher {
  color: red;
}

.cost-lower {
  color: green;
}

.cost-span-div {
  position: absolute;
  font-size: 1.25vw;
  font-weight: bolder;
  text-align: center;
  width: 100%;
  height: 100%;
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
