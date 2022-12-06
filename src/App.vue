<template>
  <div id="app" :class="{ thirdPart }">
    <div v-if="thirdPart" class="thirdPartHeader">
      <div class="navList" v-show="$route.name != 'package-details'">
        <div 
          v-for="(nav,navIndex) in navList"
          :key="navIndex"
          class="navItem" 
          :class="{active: activeName === nav.value}"
          @click="goPath(nav)"
        >
          <div class="link" :to="nav.path">{{ nav.label }}</div>
          <div class="Bottomborder"></div>
        </div>
      </div>
    </div>
    <div class="header" v-if="isShow && !thirdPart">
      <router-link to="/">
        <img src="@/assets/images/logo.png" alt="">
      </router-link>
      <div class="navList" v-show="$route.name != 'package-details'">
        <div 
          v-for="(nav,navIndex) in navList"
          :key="navIndex"
          class="navItem" 
          :class="{active: activeName === nav.value}"
          @click="goPath(nav)"
        >
          <div class="link" :to="nav.path">{{ nav.label }}</div>
          <div class="Bottomborder"></div>
        </div>
      </div>
      <div class="login">
       <!-- <el-button class="loginBtn">登录</el-button> -->
      </div>
    </div>
    <template v-if="isShow">
      <ProductInformation />
    </template>
    <div>
      <!-- <div class="container mt-3"> -->
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Download, Search, Expand } from '@element-plus/icons-vue'
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import ProductInformation from '@/components/productInformation.vue';
import { mapMutations, mapGetters} from 'vuex';

export default defineComponent({
  name: "App",
  components: {
    ProductInformation
  },
  data() {
    return {
      downloadIcon: Download,
      Search: Search,
      Expand: Expand,
      useRouter: useRouter,
      navList: [
        { label: '风险看板', path: '/sbomDashboard', value: 'sbomDashboard' },
        { label: '软件成分查询', path: '/sbomPackages', value: 'sbomPackages' },
        { label: '开源软件反向追溯链', path: '/sbomTraceChain', value: 'sbomTraceChain' },
      ],
      activeName: this.$route.name || '',
      isShow: false,
      thirdPart: false
    }
  },
  computed:{
    ...mapGetters([
      'getIsThirdPart'
    ])
  },
  methods: {
    goPath(nav: any) {
      this.$router.push({
        path: nav.path
      })
    },
    ...mapMutations(['setIsThirdPart'])

  },
  watch: {
    $route: {
      deep: true,
      handler(route) {
        this.isShow = !route.path.includes('sbomPackageDetail')
        if(this.isShow) {
          this.activeName = route.name || ''
        }
        // 判断是否第三方平台
        if(route.query) {
          const query = route.query
          if(query.thirdPart) {
            this.setIsThirdPart(query.thirdPart)
          }
        }
      }
    },
    getIsThirdPart() {
      this.thirdPart = this.getIsThirdPart === '1'
    }
  },
  mounted() {
    this.thirdPart = this.getIsThirdPart === '1'
  },

  provide() {
    return {
      
    }
  }
});
</script>

<style lang="less">
@import './assets/css/common.less';
#app{
  background-color: #F0F3F6;
  min-height: 100vh;
  min-width: 1400px;
  overflow: auto;
  .header{
    height: 73px;
    background-color: #191A35;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    font-size: 14px;
    .navList{
      width:calc(100% - 420px);
      display: flex;
      align-items: center;
      padding-top: 10px;
      .navItem{
        margin-left: 84px;
        min-width: 60px;
        text-align: center;
        cursor: pointer;
        .Bottomborder{
          height: 3px;
          background-color: transparent;
          width: 30px;
          margin: 10px auto 0;
        }
        .link{
          color: #ffffff;
          opacity: 0.5;
        }
        &:hover,
        &.active{
          .link{
            opacity: 1;
          }
          .Bottomborder{
            background-color: #fff;
          }
        }
      }
    }
    .login{
      min-width: 50px;
      .loginBtn{
        background-color: #3F4764;
        border-radius: 4px;
        padding: 11px 13px;
        color: #ffffff;
        border:none;
      }
    }
  }
  .thirdPartHeader{
    border-bottom: 1px solid #e7eaeb;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-left: 30px;
    .navList{
      display: flex;
      align-items: center;
      .navItem{
        font-size: 16px;
        color: #191A35;
        padding: 20px 0;
        margin-right: 50px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        &.active{
          color: #4971FF;
          border-bottom-color: #4971FF;
        }
      }
    }
  }
}
</style>
