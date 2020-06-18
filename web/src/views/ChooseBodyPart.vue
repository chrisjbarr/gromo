<template>
  <div v-if="activity.bodyParts.length > 0">
    <label>Awesome, let's do some {{ activity.name }}! What area are you focusing on?</label>
    <ul class="my-4 divide-y divide-gray-300">
      <li v-for="bodyPart in activity.bodyParts" :key="bodyPart.name">
        <button class="w-full p-2" @click="setBodyPart(bodyPart.name)">{{ bodyPart.name }}</button>
      </li>
    </ul>

    <div class="mt-5">
      <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded" @click="back()">Back</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ChooseBodyPart',
  methods: {
    setBodyPart(id) {
      this.$store.commit('set-body-part', id);
      this.$router.push({ name: `choose-exercise` });
    },
    back() {
      this.$store.commit('reset');
      this.$router.push({ name: `home` });
    }
  },
  computed: {
    ...mapState(['activity'])
  }
};
</script>
