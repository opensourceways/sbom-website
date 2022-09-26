<template>
  <div class="productInformation-container">
    <div class="sbom-header">
      <div class="title-text" @click="showQuery = !showQuery">
        <img src="@/assets/images/titleIcon.png" alt="">
        制品信息： <span>{{ getProductName }}</span>
      </div>
      <div class="download-btn">
        <sbomDownloadPop :productName="getProductName" />
      </div>
    </div>
    <div class="orgnization" v-if="showQuery">
      <div class="label">开源社区：</div>
      <div class="orgnization-btns">
        <div 
          class="orgnization-btn" 
          v-for="item in productTypeList" 
          :key="item" 
          :label="item" 
          :value="item"
          :class="{active: productType === item}"
          @click="handleProductTypeChange(item)"
        >
          {{ item }}
        </div>
      </div>
      <div class="search">
        <!-- 筛选
        <el-icon :size="12" color="#191A35">
          <ArrowDown />
        </el-icon> -->
      </div>
    </div>
    <div class="query-list" v-if="showQuery">
      <el-form ref="productFormRef" label-position="left" :model="productForm.data" :rules="productForm.rules" label-width="auto">
        <el-form-item 
          v-for="(item, key) in productConfigList"
          :key="key" 
          :label="item.label + '：'" 
          :prop="item.name"
        >
          <FormItem :formData="productForm" :data="item">
          </FormItem>
        </el-form-item>
      </el-form>
      <div class="query-btns" v-if="productConfigList && productConfigList.length">
        <el-button type="primary" @click="queryArtifactInfo(productFormRef)">确定</el-button>
        <el-button type="info" @click="reset">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { FormInstance, ElMessage } from 'element-plus'
import { Download, Search, Expand, ArrowDown } from '@element-plus/icons-vue'
import { defineComponent, ref, reactive } from "vue";
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import FormItem from '@/components/ProductFormItem';
import sbomDownloadPop from '@/components/SbomDownloadPop.vue';
import ProductItemConfig from '@/types/ProductItemConfig';
import { CloseProductDrawer, ParseUriProductName } from '@/utils';
import { useRouter } from 'vue-router';
import { mapMutations, mapGetters} from 'vuex';

export default defineComponent({
  name: "ProductInformation",
  components: {
    FormItem,
    sbomDownloadPop,
    // ArrowDown
  },
  setup() {
    const productFormRef = ref<FormInstance>();
    return {
      productFormRef
    }
  },
  data() {
    return {
      isRouterAlive: true,
      downloadIcon: Download,
      Search: Search,
      Expand: Expand,
      useRouter: useRouter,

      productDrawer: false,
      ParseUriProductName: ParseUriProductName,

      productName: (window as any).SBOM_PRODUCT_NAME ? (window as any).SBOM_PRODUCT_NAME : "" as string,
      productType: "",

      productTypeList: [],
      productConfigList: [] as ProductItemConfig[],

      productForm: reactive({
        data: {},
        rules: {},
      }),
      showQuery: false

    }
  },
  computed:{
    ...mapGetters([
      'getProductName'
    ])
  },
  methods: {

    getProductTypeList() {
      SbomDataService.queryProductType()
        .then((response: ResponseData) => {
          this.productTypeList = response.data;
        })
        .catch((e: Error) => {
          console.error('query product type list failed:', { e });
        });
    },

    async queryArtifactInfo(formElem: FormInstance | undefined) {
      if (!formElem) return
      await formElem.validate((valid, fields) => {
        if (valid) {
          SbomDataService.queryProduct(this.productType, this.productForm.data)
            .then((response: ResponseData) => {
              this.productName = response.data.name;
              // (window as any).SBOM_PRODUCT_NAME = response.data.name;
              if(response.data.name.startsWith('/')) {
                response.data.name = response.data.name.slice(1)
              }
              this.setProductName(response.data.name);
              this.showQuery = false
            })
            .catch((e: any) => {
              console.error('query artifact info failed:', { e });
              if (e['response'] && e['response']['status'] == 500) {
                ElMessage.error(e['response']['data'])
              }
            });

        }
      })
    },
    reset() {
      this.productForm.data = {}
      this.setProductName('')
    },

    handleProductTypeChange(productType: string) {
      if(productType === this.productType) return
      this.productType = productType
      SbomDataService.queryProductConfig(productType)
        .then((response: ResponseData) => {
          this.productConfigList = response.data;

          if (this.productConfigList) {
            // 动态拼装表单对象&表单校验规则
            let formDataMap: Record<string, any> = {};
            let formRuleMap: Record<string, any> = {};

            this.productConfigList.forEach(productConfig => {
              if (productConfig.valueType == 'string') {
                formDataMap[productConfig.name] = "";
                formRuleMap[productConfig.name] = [
                  { required: true, message: '请输入 ' + productConfig.name, trigger: 'blur' }
                ];

              } else if (productConfig.valueType == 'number') {
                formDataMap[productConfig.name] = 0;
                formRuleMap[productConfig.name] = [
                  { required: true, message: '请输入 ' + productConfig.name },
                  { type: 'number', message: productConfig.name + '必须是数字' },
                ]
              } else if (productConfig.valueType.startsWith('enum')) {
                formDataMap[productConfig.name] = "";
                formRuleMap[productConfig.name] = [
                  { required: true, message: '请选择 ' + productConfig.name, trigger: 'change' }
                ];

              }
            });
            this.productForm.data = reactive(formDataMap);
            this.productForm.rules = reactive(formRuleMap);
            // reset form validate
            setTimeout(() => {
              this.resetProductForm();
            })

          }
        })
        .catch((e: Error) => {
          console.error('query product config failed:', { e });
        });
    },

    resetProductForm() {
      if (this.productFormRef) {
        this.productFormRef.resetFields();
      }
    },

    reload() {
      this.isRouterAlive = false;
      this.$nextTick(function () {
        this.isRouterAlive = true;
      })
    },
    ...mapMutations(['setProductName'])

  },

  provide() {
    return {
      reload: this.reload
    }
  },

  mounted() {
    this.getProductTypeList();
    // this.productName = this.ParseUriProductName();
  },
});
</script>

<style lang="less" scoped>
.productInformation-container{
  width: 100%;
  height: auto;
  background-color: #ffffff;
  padding: 0px 30px 0px 30px;
  .sbom-header{
    display: flex;
    justify-content: space-between;
    height: 50px;
    align-items: center;
    border-bottom: 1px solid #EEF0F1;
    .title-text{
      font-size: 16px;
      font-weight: bold;
      color: #000000;
      margin-left: 10px;
      cursor: pointer;
      img{
        margin-right: 5px;
      }
      span{
        font-weight: normal;
      }
    }
  }
  .orgnization{
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .label{
      font-size: 14px;
      color: #666666;
    }
    .search{
      min-width: 60px;
      font-size: 16px;
      color: #191A35;
      cursor: pointer;
    }
    .orgnization-btns{
      width:calc(100% - 200px);
      display: flex;
      justify-content: flex-start;
      .orgnization-btn{
        height: 36px;
        line-height: 32px;
        padding-left:16px;
        padding-right:16px;
        background-color: #FFFFFF;
        border: 1px solid #CFD5E3;
        border-radius: 18px;
        cursor: pointer;
        font-size: 14px;
        color:#CFD5E3;
        margin-right: 25px;
        &.active{
          background-color: #4971FF;
          color: #ffffff;
        }
      }
    }
  }
}
</style>
<style lang="less">
.productInformation-container{
  .query-list{
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    .el-form {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      .el-form-item{
        height: 36px;
        line-height: 36px;
        margin-right: 30px;
        &:last-child{
          margin-right: 0px;
        }
        .el-form-item__label-wrap{
          margin-right: 10px;
          .el-form-item__label{
            height: 36px;
            line-height: 36px;
            margin-bottom: 0px;
            padding-right: 0px;
            color: #666666;
            font-size: 14px;
          }
        }
        .el-form-item__content{
          .el-select{
            margin:0;
          }
          .el-input__inner{
            height: 36px;
            background-color: #FFFFFF;
            border-radius: 4px;
            &::placeholder {
              color: #CFD5E3;
              font-size: 14px;
            }
          }
        }
      }
    }
    .query-btns{
      display: flex;
      .el-button--primary{
        background-color: #4971FF;
        border:none;
      }
      .el-button--info{
        color: #191A35;
        background-color: #ffffff;
        border-color: #CFD5E3;
      }
    }
  }
  
}
</style>
