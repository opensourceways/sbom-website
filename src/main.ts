import { createApp } from "vue";
import App from "@/App.vue";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import router from "@/router";
import store from '@/store';

const app =createApp(App).use(router).use(store).use(ElementPlus);
app.mount("#app");
