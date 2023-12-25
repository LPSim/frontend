<template>
  <div :class="{ 'card': true, 'active-card': card.is_active }" @click="log_data">
    <img class="main-img" :src="image_link" :alt="image_alt" width="100%" height="100%" @error="imgSrcError($event)" />
    <div class="card-text">
      <span>{{ image_alt }}</span>
    </div>
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
  data () {
    return {
      dataAttribute: null
    }
  },
  computed: {
    image_link() {
      return this.$store.getters.getImagePath(this.card)
    },
    image_alt() {
      let type = this.card.type;
      if (type == 'TALENT') {
        type = type + '_' + this.card.charactor_name;
      }
      if (this.card.name == 'Unknown') type = 'CARD'
      return this.$t(type + '/' + this.$store.getters.getNameWithDesc(this.card));
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
  box-shadow: 0 0 0.25vw 0.25vw rgb(255, 174, 0);
  border-radius: 5%;
}

img {
  position: absolute;
}

.cost-outer-div {
  /* position: absolute; */
  position: relative;
  flex-direction: column;
  width: 36.615%;
  height: 100%;
  top: -100%;
}

.main-img {
  font-size: 1vw;
}

.card-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: 0.1vw;
  border-color: #6B5531;
  border-style: solid;
  border-radius: 0.5vw;
}

.card-text > span {
  word-break: break-all;
}

</style>
