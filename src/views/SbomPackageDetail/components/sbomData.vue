<template>
  <div class="sbomData-container">
    <div class="sbomData-part">
      <div class="part-title">
        <img src="@/assets/images/titleIcon2.png" alt="">
        General
      </div>
      <div class="content-box">
        <div class="content">
          <div class="label">软件包名称：</div><div class="name">{{ sbomData.name }}</div>
        </div>
        <div class="content">
          <div class="label" v-if="flag">版本(epoch:version-release)：</div>
          <div class="label" v-else>版本：</div>
          <div class="name">{{ sbomData.version }}</div>
        </div>
        <div class="content">
          <div class="label">来源信息：</div><div class="name">{{ sbomData.sourceInfo }}</div>
        </div>
        <div class="content">
          <div class="label">License：</div>
          <template v-if="sbomData.licenseDeclared">
            <div 
              class="license" 
              v-for="(license,index) in sbomData.licenseDeclared.split('and')" 
              :key="index"
            >
              <span class="dot"></span>
              <span class="txt">{{ license }}</span>
            </div>
          </template>
        </div>
        <div class="content">
          <div class="label">漏洞：</div>
          <template v-for="(vul, vulIndex) in vluProps" :key="vulIndex">
            <div 
              :class="['vulBtns','vul'+vulIndex]" 
              v-if="sbomData.vulList && (sbomData.vulList[vul.prop] || sbomData.vulList[vul.prop]===0)"
              :key="vulIndex"
            >
              <span class="txt">{{ vul.label }}</span>
              <span class="num">{{ sbomData.vulList[vul.prop] }}</span> 
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="sbomData-part">
      <div class="part-title">
        <img src="@/assets/images/titleIcon2.png" alt="">
        Source  Control
      </div>
      <div class="content-box inline">
        <div class="content">
          <div class="label">Home Page:</div>
          <!-- <el-tooltip effect="dark" :content="sbomData.homepage" placement="top">
            <div class="name link" @click="goPath(sbomData.homepage)">{{ sbomData.homepage }}</div>
          </el-tooltip> -->
          <div class="name">{{ sbomData.homepage }}</div>
        </div>
        <div class="content">
          <div class="label">Download Location:</div>
          <el-tooltip effect="dark" :content="sbomData.downloadLocation" placement="top">
            <!-- <div class="name link" @click="goPath(sbomData.downloadLocation)">{{ sbomData.downloadLocation }}</div> -->
            <div class="name">{{ sbomData.downloadLocation }}</div>
          </el-tooltip>
        </div>
        <div class="content">
          <div class="label">Supplier:</div><div class="name">{{ sbomData.supplier }}</div>
        </div>
      </div>
    </div>
    <div class="sbomData-part">
      <div class="part-title">
        <img src="@/assets/images/titleIcon2.png" alt="">
        Description
      </div>
      <div class="content-box">
        {{ sbomData.description }}
      </div>
    </div>
    <div class="sbomData-part">
      <div class="part-title">
        <img src="@/assets/images/titleIcon2.png" alt="">
        Summary
      </div>
      <div class="content-box">
        {{ sbomData.summary }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { IsOpenEulerByProductName } from "@/utils"

export default defineComponent({
  name: "sbom-data",
  components: {
    
  }, 
  props: {
    sbomData: {
      type: Object,
      default: ()=>{
        return {}
      }
    }
  },
  data() {
    return {
      vluProps: [
        { label: '致命', prop: 'criticalVulCount' },
        { label: '高', prop: 'highVulCount' },
        { label: '中', prop: 'mediumVulCount' },
        { label: '低', prop: 'lowVulCount' },
        { label: '无风险', prop: 'noneVulCount' },
        { label: '未知', prop: 'unknownVulCount' },
      ],
      flag: false
    };
  },
  methods: {
    goPath(url) {
      if(url) {
        window.open(url, '_blank')
      }
    }
  },
  mounted() {
    this.flag = this.$route.params.flag.toString() === 'true' ? true : false
  }
});
</script>

<style lang="less" scoped>
.sbomData-container{
  padding: 0 20px;
  .sbomData-part{
    padding: 20px 0;
    border-bottom: 2px dashed #D9E0ED;
    &:last-child{
      border-bottom: none;
    }
    .part-title{
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 10px;
      img{
        margin-right: 10px;
      }
    } 
    .content-box{
      font-size: 14px;
      color: #000000;
      .content{
        display: flex;
        margin-top: 10px;
        align-items: center;
        .label{
          color: #666666;
          margin-right: 10px;
          min-width: 60px;
        }
        .name{
          max-width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          &.link{
            cursor: pointer;
            &:hover{
              color:#4971FF
            }
          }
        }
        .license{
          height: 32px;
          line-height: 30px;
          padding: 0 10px;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          font-size: 14px;
          color: #000000;
          margin-right: 10px;
          .dot{
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #626CD9;
            border-radius: 50%;
            margin-right: 5px;
          }
        }
      }
      &.inline{
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>
