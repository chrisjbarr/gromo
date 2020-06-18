<template>
  <div v-if="activities.length > 0">
    <label>Hello {{ gromoer.name }}, what type of activity are you going to try?</label>
    <ul class="my-4 divide-y divide-gray-300">
      <li v-for="activity in activities" :key="activity.name">
        <button class="w-full p-2" @click="setActivity(activity.name)">{{ activity.name }}</button>
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
  name: 'ChooseActivity',
  methods: {
    setActivity(name) {
      this.$store.commit('set-activity', name);
      this.$router.push({ name: 'choose-body-part' });
    },
    back() {
      this.$store.commit('reset');
      this.$router.push({ name: 'home' });
    }
  },
  computed: {
    ...mapState(['activities', 'gromoer'])
  }
};
</script>
