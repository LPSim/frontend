<template>
  <div class="cost-div" :style="'flex-direction: ' + direction + '; justify-content: ' + justify + ';'" v-if="cost">
    <div v-for="(c, cid) in cost_computed" :key="cid" :style="costDivStyle()">
      <div :style="imgDivStyle(c)">
        <img
          :src="image_path('DICE', c.type)"
          :alt="c.type"
          width="100%"
          height="100%"
          @error="imgSrcError($event)"
        />
        <div :class="'cost-text cost-text-' + c.type.toLowerCase()">
          <span>●</span>
        </div>
      </div>
      <div class="cost-span-div" :style="spanDivStyle()">
        <span
          :class="{ 'cost-higher': c.is_higher, 'cost-lower': c.is_lower }"
          >{{ c.value }}</span
        >
      </div>
    </div>
  </div>
</template>

  <script>
export default {
  name: "Cost",
  props: {
    cost: {
      required: true,
      default: null
    },
    max_number: {
      type: Number,
      default: 5
    },
    offset_left: {
      type: Number,
      default: 0
    },
    offset_top: {
      type: Number,
      default: 0
    },
    direction: {
      type: String,
      default: 'column'
    },
    justify: {
      type: String,
      default: 'flex-start'
    },
    cost_font_size: {
      type: Number,
      default: 1.25
    }
  },
  data() {
    return {
      imgError: new Array(4).fill(0),
      dataAttribute: null,
      firstTime: true,
    };
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
      setTimeout(() => {
        this.updateFontSize();
      }, 0);
    },
    updateFontSize() {
      let font_size = this.cost_font_size / 1.25 * 3;
      let stroke = font_size / 3 * 0.25;
      let offset = font_size / 10;
      let divElements = this.$el.querySelectorAll('.cost-text');
      let spanElements = this.$el.querySelectorAll('.cost-text > span');
      for (let i = 0; i < divElements.length; i++) {
        let divElement = divElements[i];
        let spanElement = spanElements[i];
        divElement.style.fontSize = font_size + 'vw';
        divElement.style.webkitTextStrokeWidth = stroke + 'vw';
        spanElement.style.transform = `translateY(-${offset}vw)`;
      }
    },
    costDivStyle () {
      let style = {
        width: `${100 / this.max_number}%`,
        height: `${100 / this.max_number}%`,
        marginLeft: `-${this.offset_left}%`,
        marginTop: `-${this.offset_top}%`,
        marginBottom: `${this.offset_top}%`,
        marginRight: `${this.offset_left}%`,
      }
      if (this.direction == 'column') style.width = '100%'
      else style.height = '100%'
      return style
    },
    image_path(type, name) {
      return this.$store.getters.getImagePath({
        type: type,
        name: name
      })
    },
    imgDivStyle(c) {
      let full_width = (c.type == 'CHARGE' || c.type == 'ARCANE_FULL');
      let ret = {
        width: (full_width ? 100 : 93.75) + '%',
        'margin-left': full_width ? '0%' : '3.125%',
        height: '100%'
      };
      return ret;
    },
    spanDivStyle() {
      let text_stroke_width = this.cost_font_size / 1.25;
      return {
        'font-size': this.cost_font_size + 'vw',
        '-webkit-text-stroke-width': text_stroke_width + 'px',
      }
    }
  },
  computed: {
    cost_computed() {
      let now_cost = this.cost
      let ori_cost = this.cost.original_value
      if (!ori_cost) ori_cost = now_cost  //cannot use this card, and no original cost
      let res = []
      if (ori_cost.elemental_dice_number > 0)
        res.push({
          type: now_cost.elemental_dice_color,
          value: now_cost.elemental_dice_number,
          is_higher: now_cost.elemental_dice_number > ori_cost.elemental_dice_number,
          is_lower: now_cost.elemental_dice_number < ori_cost.elemental_dice_number
        })
      if (ori_cost.same_dice_number > 0)
        res.push({
          type: 'MATCHING',
          value: now_cost.same_dice_number,
          is_higher: now_cost.same_dice_number > ori_cost.same_dice_number,
          is_lower: now_cost.same_dice_number < ori_cost.same_dice_number
        })
      if (ori_cost.any_dice_number > 0)
        res.push({
          type: 'UNALIGNED',
          value: now_cost.any_dice_number,
          is_higher: now_cost.any_dice_number > ori_cost.any_dice_number,
          is_lower: now_cost.any_dice_number < ori_cost.any_dice_number
        })
      if (ori_cost.charge > 0)
        res.push({
          type: 'CHARGE',
          value: now_cost.charge,
          is_higher: now_cost.charge > ori_cost.charge,
          is_lower: now_cost.charge < ori_cost.charge
        })
      if (res.length == 0)
        res.push({
          type: 'MATCHING',
          value: 0,
          is_higher: false,
          is_lower: false
        })
      if (ori_cost.arcane_legend)
        res.push({
          type: 'ARCANE_FULL',
        })
      return res
      // let res = [
      //   { type: 'GEO', value: 2, is_higher: true, is_lower: false},
      //   { type: 'UNALIGNED', value: 1, is_higher: false, is_lower: true},
      //   { type: 'MATCHING', value: 3, is_higher: false, is_lower: false},
      //   { type: 'CHARGE', value: 2, is_higher: false, is_lower: false},
      // ]

    }
  }
};
</script>

<style scoped>

.cost-div {
  width: 100%;
  height: 100%;
  display: flex;
}
.cost-div > div {
  position: relative;
}

.cost-higher {
  color: red;
}

.cost-lower {
  color: rgb(58, 243, 58);
}

.cost-span-div {
  position: absolute;
  font-weight: bolder;
  text-align: center;
  left: 0;
  top: 0;
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

.cost-text {
  width: 100%;
  height: 100%;
  display: none;
  justify-content: center;
  align-items: center;
  /* font-size: 3vw; */
  -webkit-text-stroke-color: #000;
}

/* .cost-text > span {
  transform: translateY(-0.3vw);
} */

.cost-text-anemo {
  color: #54F0C0;
  -webkit-text-stroke-color: #30776E;
}

.cost-text-hydro {
  color: #52D3FF;
  -webkit-text-stroke-color: #4161A6;
}

.cost-text-pyro {
  color: #FF955F;
  -webkit-text-stroke-color: #9B4838;
}

.cost-text-cryo {
  color: #98E4E4;
  -webkit-text-stroke-color: #337683;
}

.cost-text-electro {
  color: #D19AFF;
  -webkit-text-stroke-color: #6A3EB3;
}

.cost-text-geo {
  color: #EACE5B;
  -webkit-text-stroke-color: #7C5D2F;
}

.cost-text-dendro {
  color: #BEDD76;
  -webkit-text-stroke-color: #647E31;
}

.cost-text-matching {
  color: #DDD5C4;
  -webkit-text-stroke-color: #9C917C;
}

.cost-text-charge {
  color: #E69E3A;
  -webkit-text-stroke-color: #B66514;
}

.cost-text-unaligned {
  color: #626262;
  -webkit-text-stroke-color: #3B3B3B;
}

.cost-text-arcane_full {
  color: #E4ACF0;
  -webkit-text-stroke-color: #957D65;
}

</style>
