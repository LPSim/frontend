<template>
  <div :class="{ 'card': true, 'active-card': card.is_active }" @click="log_data">
    <img :src="image_link" :alt="card.name" width="100%" height="100%" />
    <!-- <p>{{ card.name }}</p> -->
    <!-- <p>Cost: {{ card.cost }}</p> -->
    <div class="cost-outer-div" v-if="card.name != 'Unknown'">
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
  computed: {
    image_link() {
      return this.$store.getters.getImagePath({
        type: 'card',
        name: this.card.name
      })
    }
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
      console.log('CARD', JSON.parse(JSON.stringify(this.card)))
      this.$store.commit('setSelectedObject', this.card);
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
  box-shadow: 0 0 3px 3px rgb(255, 174, 0);
  border-radius: 5%;
}

img {
  position: absolute;
}

.cost-outer-div {
  /* position: absolute; */
  position: relative;
  flex-direction: column;
  width: 35.625%;
  height: 100%;
}


</style>
