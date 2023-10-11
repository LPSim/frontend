<template>
  <div class="deck-container">
    <div class="deck-content">
      <h2>Charactors:</h2>
      <ul>
        <li v-for="charactor in deck.charactors" :key="charactor.id">
          {{ charactor.name }}
        </li>
      </ul>
      <h2>Cards:</h2>
      <ul>
        <li v-for="card in deck.cards" :key="card.id">
          <img :src="getCardImageUrl(card)" alt="Card Image" width="84" height="120" />
          {{ card.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    deck: {
      type: Object,
      required: true
    }
  },
  methods: {
    getCardImageUrl(card) {
      return `/img/cards/${card.name}.png`;
    }
  }
}
</script>

<style>
.deck-container {
  overflow: auto;
  position: relative;
}

.deck-content {
  padding: 10px;
}
</style>
