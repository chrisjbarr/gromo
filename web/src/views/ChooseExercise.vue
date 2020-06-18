<template>
  <div class="flex flex-col">
    <label class="font-semibold">Which exercise do you want to do?</label>

    <div v-if="bodyPart.exercises.length > 0" class="w-full h-64 overflow-auto my-4">
      <ul class="my-4 divide-y divide-gray-400">
        <li v-for="exercise in bodyPart.exercises" :key="exercise.name">
          <button class="w-full p-2" @click="setBodyPart(exercise.name)">{{ exercise.name }}</button>
        </li>
      </ul>
    </div>

    <div>
      <span class="text font-semibold block">Add a new exercise:</span>

      <div class="mt-5">
        <input
          type="text"
          v-model="name"
          value="text"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div class="mt-5">
        <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded" @click="addGromoer()">Add</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ChooseBodyPart',
  data() {
    return {
      name: ''
    };
  },
  methods: {
    setBodyPart(id) {
      this.$store.commit('set-exercise', id);
      this.$router.push({ name: `workout` });
    },
    back() {
      this.$store.commit('reset');
      this.$router.push({ name: `home` });
    }
  },
  computed: {
    ...mapState(['activity', 'bodyPart'])
  }
};
</script>
