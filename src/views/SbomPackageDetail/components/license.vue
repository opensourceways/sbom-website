<template>
  <div class="sbomData-container">
    <div class="sbomData-part">
      <div class="part-title">
        <img src="@/assets/images/titleIcon2.png" alt="">
        License
      </div>
      <div class="content-box">
        <div class="content">
          <div class="buttons" v-for="(license, licenseIndex) in licenseContent" :key="licenseIndex">
            <el-tooltip v-if="license.licenseName" effect="dark" :content="license.licenseName" placement="top">
              <div class="licenseItem" :class="{ canClick: license.licenseUrl}" @click="goPath(license)">
                <span :class="['dot', license.legal ? 'green' : 'red']"></span>
                <span class="txt">{{ license.licenseId }}</span>
              </div>
            </el-tooltip>
             <div v-else class="licenseItem" :class="{ canClick: license.licenseUrl}" @click="goPath(license)">
                <span :class="['dot', license.legal ? 'green' : 'red']"></span>
                <span class="txt">{{ license.licenseId }}</span>
              </div>
          </div>
        </div>
      </div>
    </div>
    <div class="sbomData-part">
      <div class="part-title">
        <img src="@/assets/images/titleIcon2.png" alt="">
        Copyrights
      </div>
      <div class="content-box inline">
        <div class="content">
          <div class="label">organization:</div><div class="name">{{ copyrightContent.length ? copyrightContent[0].organization : '' }}</div>
        </div>
        <div class="content">
          <div class="label">Start  Year:</div><div class="name">{{ copyrightContent.length ? copyrightContent[0].startYear : '' }}</div>
        </div>
        <div class="content">
          <div class="label">Additional Info:</div><div class="name">{{ copyrightContent.length ? copyrightContent[0].additionalInfo : '' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";

export default defineComponent({
  name: "license",
  components: {
    
  },
  props: {
    license: {
      type: Object,
      default: ()=>{
        return {}
      }
    }
  },
  data() {
    return {
      licenseContent: [],
      copyrightContent: []
    };
  },
  methods: {
    queryPackageLicenseAndCopyright() {
      const packageId: string = this.$route.params.id.toString()
      SbomDataService.queryPackageLicenseAndCopyright(packageId)
        .then((response: ResponseData) => {
          const { licenseContent, copyrightContent } = response.data
          this.licenseContent = licenseContent;
          this.copyrightContent = copyrightContent;
        })
        .catch((e: Error) => {
          this.licenseContent = []
          this.copyrightContent = []
          console.error('query package details failed:', { e });
        });
    },
    goPath(item) {
      if(item.licenseUrl) {
        window.open(item.licenseUrl, '_blank')
      }
    }
  },
  mounted() {
    this.queryPackageLicenseAndCopyright();
  },
});
</script>

<style lang="less" scoped>
.sbomData-container{
  padding: 0 20px;
  .sbomData-part{
    padding: 20px 0 10px 0;
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
        align-items: center;
        margin-top: 10px;
        flex-wrap: wrap;
        .label{
          color: #666666;
          margin-right: 10px;
          min-width: 60px;
          &.spe{
            min-width: 115px;
          }
        }
        .buttons{
          display: flex;
          margin-bottom: 10px;
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
