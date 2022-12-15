<template>
  <div class="sbom-container">
    <div class="sbom-main">
      <div class="numberModules">
        <div 
          v-for="(module, moduleIndex) in numberModules"
          :key="moduleIndex"
          :class="['module', 'class' + moduleIndex, { canClick: module.canClick }]"
          @click="handleModule(module)"
        >
          <div class="img">
            <img :src="module.imgSrc" alt="">
          </div>
          <div class="numberTxt">
            <div class="number">{{ numberList[module.prop] || 0 }}</div>
            <div class="txt">{{ module.name }}</div>
          </div>
        </div>
      </div>
      <div class="chartPart">
        <div class="chartPart-title">
          · 漏洞数据分析
          <el-tooltip placement="right" effect="light">
            <template #content> 
              <img src="@/assets/images/vulSeverity.png" alt="">
            </template>
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="charts">
          <div class="part">
            <div class="chart-title">
              <img src="@/assets/images/titleIcon.png" alt="">
              漏洞数量统计
            </div>
            <div class="chart">
              <SbomEchart 
                chartId="vulnerabilityCounts"
                chartType="bar"
                :dataList="vulnerabilityCountsData"
                @echartsClick="openVulnDialog"
              />
            </div>
          </div>
          <div class="part">
            <div class="chart-title">
              <img src="@/assets/images/titleIcon.png" alt="">
              漏洞组件统计
            </div>
            <div class="chart">
              <SbomEchart 
                chartId="vulnerabilityComponents"
                chartType="bar"
                :dataList="vulnerabilityComponentsData"
                @echartsClick="(val) => { gotoPackages(val, 'vulSeverity') }"
              />
            </div>
          </div>
        </div>
        <div class="part">
          <div class="chart-title">
            <img src="@/assets/images/titleIcon.png" alt="">
            漏洞消减趋势
          </div>
          <div class="chart">
            <SbomEchart 
              chartId="vulnerabilityTrends"
              chartType="line"
              :dataList="vulnerabilityTrendsData"
              :props="vulTrendProps"
            />
          </div>
        </div>
        <div class="part">
          <div class="chart-title">
            <img src="@/assets/images/titleIcon.png" alt="">
            Zero-Day漏洞风险跟踪
          </div>
          <div class="chart">
            <SbomEchart 
              chartId="zeroDayVulnerabilityTrends"
              chartType="line"
              :dataList="zeroDayVulnerabilityTrendsData"
              :props="zeroDayVulTrendProps"
            />
          </div>
        </div>
      </div>
      <div class="chartPart">
        <div class="chartPart-title">
          · Licence数据分析
        </div>
        <div class="charts">
          <div class="part">
            <div class="chart-title">
              <img src="@/assets/images/titleIcon.png" alt="">
              风险Licence
            </div>
            <div class="partContent">
              <div class="modules">
                <div 
                  v-for="(license, licenseIndex) in licenseNumberModules"
                  :key="licenseIndex"
                  @click="gotoPackages(license.prop, 'license')"
                  class="module"
                >
                  <div :class="['img', 'class' + licenseIndex]">
                    <img :src="license.imgSrc" alt="">
                  </div>
                  <div class="numberTxt">
                    <div class="number">{{ licenseNumberList[license.prop] }}</div>
                    <div class="txt">{{ license.name }}</div>
                  </div>
                </div>
              </div>
              <div class="chart">
                <SbomEchart 
                  chartId="license"
                  chartType="bar"
                  :dataList="licenseData"
                  @echartsClick="(val) => { gotoPackages(val, 'license') }"
                />
              </div>
            </div>
          </div>
          <div class="part">
            <div class="chart-title">
              <img src="@/assets/images/titleIcon.png" alt="">
              Licence分布
            </div>
            <div class="chart">
              <SbomEchart 
                chartId="licenseDistributed"
                chartType="pie"
                :dataList="licenseDistributedData"
                @echartsClick="(val) => { openLicenseDialog('count', val) }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <SbomLicenseTable ref="sbomLicenseRef" />
    <el-dialog
      title="漏洞详情列表"
      v-model="showVulnDialog"
      :close-on-click-modal="false"
      width="80%"
      custom-class="sbom-dialog"
    >
      <SbomVulnerabilityTable 
        :productName="getProductName" 
        :severity="vulnSeverity" 
        isInDialog 
      />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SbomEchart from '@/views/SbomDashboard/SbomEchart.vue';
import { mapGetters} from 'vuex';
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { IsSelectArtifact, formatVulSeverity } from "@/utils"
import SbomLicenseTable from '@/components/SbomLicenseTable.vue';
import SbomVulnerabilityTable from '@/components/SbomVulnerabilityTable.vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
export default defineComponent({
  name: "sbom-dashboard",
  components: {
    SbomEchart,
    SbomLicenseTable,
    SbomVulnerabilityTable,
    QuestionFilled
  },
  setup() {
    const sbomLicenseRef: any = ref(null)
    return {
      sbomLicenseRef
    }
  },
  data() {
    return {
      numberModules: [
        { name: 'Packages', prop: 'packageCount', imgSrc: require('@/assets/images/packages.png') },
        { name: 'Modules', prop: 'moduleCount', imgSrc: require('@/assets/images/modules.png') },
        { name: 'Dependencies', prop: 'depCount', imgSrc: require('@/assets/images/dependencies.png') },
        { name: 'Runtime  Dependencies', prop: 'runtimeDepCount', imgSrc: require('@/assets/images/runtime.png') },
        { name: '漏洞', prop: 'vulCount', imgSrc: require('@/assets/images/bug.png'), canClick: true },
        { name: 'License类型', prop: 'licenseCount', imgSrc: require('@/assets/images/license.png'), canClick: true },
      ],
      licenseNumberModules: [
        { name: 'Libraries without licence', prop: 'packageWithoutLicenseCount', imgSrc: require('@/assets/images/licenseSingle.png') },
        { name: 'Multiple licences', prop: 'packageWithMultiLicenseCount', imgSrc: require('@/assets/images/licenseMultiple.png') }
      ],
      numberList: {
        packageCount: 0,
        depCount: 0,
        moduleCount: 0,
        runtimeDepCount: 0,
        vulCount: 0,
        licenseCount: 0,
      },
      licenseNumberList: {
        packageWithoutLicenseCount: 0,
        packageWithMultiLicenseCount: 0,
      },
      vulnerabilityProps: {
        criticalVulCount: '致命',
        highVulCount: '高',
        mediumVulCount: '中',
        lowVulCount: '低',
        noneVulCount: '无风险',
        unknownVulCount: '未知',
      },
      vulnerabilityComponentsProps: {
        packageWithCriticalVulCount: '致命',
        packageWithHighVulCount: '高',
        packageWithMediumVulCount: '中',
        packageWithLowVulCount: '低',
        packageWithNoneVulCount: '无风险',
        packageWithUnknownVulCount: '未知',
        packageWithoutVulCount: '不涉及'
      },
      vulnerabilityCountsData: {},
      vulnerabilityComponentsData: {},
      vulnerabilityTrendsData: [],
      zeroDayVulnerabilityTrendsData: [],
      licenseData: {},
      licenseProps: {
        packageWithLegalLicenseCount: '合规',
        packageWithIllegalLicenseCount: '不合规',
      },
      licenseDistributedData: {},
      vulTrendProps: {
        '致命': 'criticalVulCount',
        '高': 'highVulCount',
        '中': 'mediumVulCount',
        '低': 'lowVulCount',
        '无风险': 'noneVulCount',
        '未知': 'unknownVulCount'
      },
      zeroDayVulTrendProps: {
        '0 Day': 'criticalVulCount',
        '1 Day': 'highVulCount',
        '30 Day': 'mediumVulCount',
        '90 Day': 'lowVulCount',
      },
      showVulnDialog: false,
      vulnSeverity: ''
    };
  },
  computed:{
    ...mapGetters([
      'getProductName'
    ])
  },
  watch: {
    getProductName() {
      this.initData()
    }
  },
  methods: {
    resetData() {
      this.vulnerabilityCountsData = {}
      this.vulnerabilityComponentsData = {}
      this.vulnerabilityTrendsData = []
      this.licenseDistributedData = {}
      this.numberList = {
        packageCount: 0,
        depCount: 0,
        moduleCount: 0,
        runtimeDepCount: 0,
        vulCount: 0,
        licenseCount: 0,
      }
      this.licenseNumberList = {
        packageWithoutLicenseCount: 0,
        packageWithMultiLicenseCount: 0,
      }
    },
    queryProductStatistics() {
      if (!IsSelectArtifact()) {
        this.resetData()
        return
      }
      // requestParam.append('productName', (window as any).SBOM_PRODUCT_NAME);
      SbomDataService.queryProductStatistics(this.getProductName)
        .then((response: ResponseData) => {
          this.numberList = this.formatData(this.numberList, response.data, null)
          this.licenseNumberList = this.formatData(this.licenseNumberList, response.data, null)
          this.vulnerabilityCountsData = this.formatData(this.vulnerabilityCountsData, response.data, this.vulnerabilityProps)
          this.vulnerabilityComponentsData = this.formatData(this.vulnerabilityComponentsData, response.data, this.vulnerabilityComponentsProps)
          this.licenseData = this.formatData(this.licenseData, response.data, this.licenseProps)
          this.licenseDistributedData = response.data.licenseDistribution || {}
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: 'error'
            })
          }
          this.resetData()
        });
    },
    formatData(initData: any, newData: any, props: any) {
      let keys:string[] = []
      if(props) {
        keys = Object.keys(props)
      }else{
        keys = Object.keys(initData)
      }
      keys.length && keys.map(key => {
        const prop = props ? props[key] : key
        initData[prop] = newData[key] || 0
      })
      return initData
    },
    queryProductVulTrend() {
      if(!this.getProductName) return;
      let dateTime = new Date().getFullYear()
      const startTimestamp = new Date(new Date().setFullYear(dateTime-10)).getTime();
      const endTimestamp = new Date().getTime();
      SbomDataService.queryProductVulTrend(this.getProductName, startTimestamp, endTimestamp)
        .then((response: ResponseData) => {
          this.vulnerabilityTrendsData = response.data
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: 'error'
            })
          }
          this.vulnerabilityTrendsData = []
        });
    },
    initData() {
      this.queryProductStatistics()
      this.queryProductVulTrend()
    },
    handleModule(module) {
      if (!IsSelectArtifact()) {
        return
      }
      if(module.prop === 'licenseCount') {
        //License类型
        this.openLicenseDialog('licenseId', '')
      } else if(module.prop === 'vulCount') {
        // 漏洞
        this.openVulnDialog('')
      }
    },
    // 跳转至 软件成分页
    gotoPackages(prop, type) {
      let licenseType = ''
      let vulSeverity = ''
      if(type === 'license') {
        if(prop === 'packageWithoutLicenseCount') {
          licenseType = 'noLicense'
        } else if(prop === 'packageWithMultiLicenseCount') {
          licenseType = 'multiLicense'
        } else if(prop === '合规') {
          licenseType = 'legalLicense'
        } else if(prop === '不合规') {
          licenseType = 'ilegalLicense'
        }
      } else {
        vulSeverity = formatVulSeverity(prop)
      }
      
      this.$router.push({
        path: '/sbomPackages',
        query: {
          licenseType,
          vulSeverity
        }
      })
    },
    openLicenseDialog(orderBy, licenseId) {
      this.sbomLicenseRef.orderBy = orderBy
      this.sbomLicenseRef.licenseId = licenseId === '其他' ? '' : licenseId
      this.sbomLicenseRef.openDiaog()
    },
    openVulnDialog(val) {
      this.vulnSeverity = formatVulSeverity(val)
      this.showVulnDialog = true
    }
  },
  mounted() {
    this.initData()
  }
});
</script>

<style lang="less" scoped>
.sbom-main{
  .module{
    display: flex;
    align-items: center;
    height: 95px;
    padding-left: 25px;
    border-radius: 4px;
    width: calc((100% - 100px)/6);
    &.canClick{
      cursor: pointer;
    }
    .img{
      height: 48px;
      width: 48px;
      line-height: 48px;
      background-color: #ffffff;
      border-radius: 8px;
      text-align: center;
    }
    .numberTxt{
      margin-left: 30px;
      .number{
        font-size: 30px;
        font-weight: 600;
        color: #FEFEFF;
        margin-top:-10px;
      }
      .txt{
        font-size: 13px;
        font-weight: bold;
        color: #FFFFFF;
        opacity: 0.6;
        margin-top:-5px;
      }
    }
    &.class0{
      background: linear-gradient(90deg, #4E82F7 0%, #5E9AF8 100%);
    }
    &.class1{
      background: linear-gradient(90deg, #5B62F6 0%, #787FF7 100%);
    }
    &.class2{
      background: linear-gradient(90deg, #4EA7F8 0%, #58BCF9 100%);
    }
    &.class3{
      background: linear-gradient(90deg, #4971FF 0%, #5D99F7 100%);
    }
    &.class4{
      background: linear-gradient(90deg, #5BB0CB 0%, #6CC5DA 99%);
    }
    &.class5{
      background: linear-gradient(90deg, #4965D8 0%, #7C91EA 100%);
    }
  }
  .numberModules{
    display: flex;
    justify-content: space-between;
  }
  .chartPart{
    padding: 27px 27px 27px 0;
    border-radius: 4px;
    background-color: #ffffff;
    margin-top:25px;
    .chartPart-title{
      height: 48px;
      line-height: 48px;
      background-color: #1330A0;
      border-radius: 0 24px 24px 0;
      font-size: 18px;
      font-weight: bold;
      color: #FEFEFE;
      padding: 0 20px 0 10px;
      display: inline-block;
      // margin-bottom: 30px;
    }
    .charts{
      display: flex;
      justify-content: space-between;
      .part{
        width: calc(50% - 27px);
      }
    }
    .part{
      border: 1px solid #CFD5E3;
      border-radius: 12px;
      margin-left: 27px;
      margin-top: 25px;
      .chart-title{
        height: 47px;
        line-height: 35px;
        border-bottom: 1px solid #EBEBEB;
        // background-color: #F8F9FA;
        font-size: 16px;
        font-weight: bold;
        color: #000000;
        padding-left: 10px;
        margin-top:10px;
        img{
          margin-right: 10px;
        }
      }
      .chart{
        height: 345px;
      }
    }
    .partContent{
      display: flex;
      justify-content: space-between;
      .modules{
        margin-top: 42px;
        // margin-left: 38px;
        width: 40%;
        padding: 0 40px;
        .module{
          width: 100%;
          border: 1px solid #C2C5E0;
          margin-bottom: 24px;
          cursor: pointer;
          .img{
            width: auto;
            height: auto;
            line-height: inherit;
            padding: 10px;
          }
          .img.class0{
            background-color: #C2C5E0;
          }
          .img.class1{
            background-color: #4971FF;
          }
          .numberTxt{
            width: calc(100% - 80px);
            .number{
              color: #191A35;
            }
            .txt{
              color: #9DA1A6;
              opacity: 1;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            }
          }
        }
      }
      .chart{
        // width: calc(68% - 80px);
        width: 60%;
      }
    }
  }
}

</style>
