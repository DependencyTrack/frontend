import { createApp } from 'vue'
import AppBasic from './AppBasic.vue'
import router from './routerbasic'

const app = createApp(AppBasic)

app.use(router)

app.mount('#app')
