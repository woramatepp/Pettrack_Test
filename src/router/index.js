import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/login.vue';
import SignUp from '@/pages/signUp.vue';
import Overview from '@/pages/overview.vue';
import MyPet from '@/pages/mypet.vue';
import PetAdd from '@/pages/petadd.vue';
import Profile from '@/pages/userprofile.vue';

const routes = [
  { path: '/', component: Overview },
  { path: '/login', component: Login },
  { path: '/signup', component: SignUp },
  { path: '/pets', component: MyPet },
  { path: '/pets/petadd', component: PetAdd },
  { path: '/profile', component: Profile },
  {
    path: '/overview/:id',
    name: 'overview',
    component: () => import('@/pages/overview.vue'),
    props: true
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
