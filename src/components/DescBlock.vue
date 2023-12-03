<template>
  <div class="desc-block-div">
    <h3 id="title">{{ title }}</h3>
    <p id="version-p" v-if="show_version">{{ $t('Version: ') }} {{ version }}</p>
    <p id="skill-type-p" v-if="skill_type">{{ skill_type }}</p>
    <Cost id="cost" :cost="cost" direction="row" justify="flex-start" :cost_font_size="0.8" />
    <p id="detail-p" v-if="detail">{{ detail }}</p>
  </div>
</template>

<script>
import Cost from './Cost.vue';

export default {
    name: "DescBlock",
    props: {
        desc: {
            required: true,
        },
        version: {
            required: true,
        },
        show_version: {
            type: Boolean,
            default: false
        },
    },
    methods: {},
    computed: {
        name_with_desc() {
            return this.$store.getters.getNameWithDesc(this.desc);
        },
        title() {
            return this.$t(this.desc.type + '/' + this.name_with_desc);
        },
        skill_type() {
            if (!this.desc.skill_type)
                return null;
            return this.$t('SKILL_TYPE/' + this.desc.skill_type);
        },
        detail() {
            return this.$t(this.desc.type + '/' + this.name_with_desc + '/' + this.version);
        },
        cost() {
            let key = this.desc.type + '/' + this.name_with_desc + '/' + this.version;
            return this.$store.state.descKeyToCost[key];
        }
    },
    components: { Cost }
};
</script>

<style scoped>

#title {
  margin-bottom: 0;
}

#version-skill-cost {
  display: flex;
  flex-direction: row;
  height: 0.85vw;
}

#cost {
  width: 69.415%;
  height: 1vw;
  font-size: 0.69vw;
}

#version-p, #skill-type-p {
  margin-top: 0;
  margin-bottom: 0.2vw;
  color: #555;
  font-size: 0.65vw;
}

#detail-p {
  margin-top: 0;
}

</style>
