import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import ChooseActivity from '../views/ChooseActivity.vue';
import ChooseBodyPart from '../views/ChooseBodyPart.vue';
import ChooseExercise from '../views/ChooseExercise.vue';
import Workout from '../views/Workout.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/choose-activity',
    name: 'choose-activity',
    component: ChooseActivity
  },
  {
    path: '/body-parts',
    name: 'choose-body-part',
    component: ChooseBodyPart
  },
  {
    path: '/exercises',
    name: 'choose-exercise',
    component: ChooseExercise
  },
  {
    path: '/workout',
    name: 'workout',
    component: Workout
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
