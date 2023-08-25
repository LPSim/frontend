<template>
  <div :class="{ 'card': true, 'active-card': card.is_active }" @click.stop="log_data">
    <img :src="'static/images/' + card.name + '.png'" :alt="card.name" width="100%" height="100%" />
    <!-- <p>{{ card.name }}</p> -->
    <!-- <p>Cost: {{ card.cost }}</p> -->
    <div class="cost-outer-div">
      <Cost :cost="card.cost" :max_number="4.5" :offset_left="10" :offset_top="10" direction="column"/>
    </div>
  </div>
</template>

<script>
import Cost from './Cost.vue';
export default {
  name: 'Card',
  components: {
    Cost
  },
  props: {
    card: {
      type: Object,
      required: true,
      validator: (value) => {
        // return 'name' in value && 'cost' in value && 'is_active' in value
        // TODO
        return true
      }
    }
  },
  methods: {
    log_data() {
      console.log(JSON.parse(JSON.stringify(this.card)))
    }
  },
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

.cost-outer-div {
  /* position: absolute; */
  position: relative;
  flex-direction: column;
  width: 38%;
  height: 100%;
}


</style>
