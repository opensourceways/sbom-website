<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <router-link to="/" class="navbar-brand">SBOM Service</router-link>
      <div class="navbar-nav mr-auto" v-show="$route.name != 'package-details'">
        <li class="nav-item">
          <router-link to="/sbomDashboard" class="nav-link">风险看板</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/sbomPackages" class="nav-link">软件成分查询</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/sbomTraceChain" class="nav-link">开源软件反向追溯链</router-link>
        </li>
      </div>
    </nav>
    <div class="sbom-header sbom-product-name" v-show="$route.name != 'package-details'">
      <el-row :gutter="20">
        <el-col :span="23">
          <el-page-header :icon="Expand" title="选择制品信息" :content="productName" @back="OpenProductDrawer" />
        </el-col>
        <el-col :span="1">
          <sbomDownloadPop :productName="productName" />
        </el-col>
      </el-row>
      <el-divider />
    </div>

    <div>
      <!-- <div class="container mt-3"> -->
      <router-view v-if="isRouterAlive" />
    </div>

    <el-drawer v-model="productDrawer" title="I am the title" :with-header="false">
      <div>
        <span>选择制品信息</span>
      </div>
      <el-divider />
      <div>
        <span>开源社区：</span>
        <el-select v-model="productType" class="m-2" placeholder="Select" size="large"
          @change="handleProductTypeChange">
          <el-option v-for="item in productTypeList" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <el-divider />

      <div>
        <el-form ref="productFormRef" :model="productForm.data" :rules="productForm.rules" label-width="auto">
          <el-row v-for="(item, key) in productConfigList" :key="key" :gutter="12">
            <el-col :span="22">
              <el-form-item :label="item.label + '：'" :prop="item.name" label-width="120px">
                <FormItem :formData="productForm" :data="item">
                </FormItem>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="productConfigList && productConfigList.length">
            <el-col :span="24">
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="queryArtifactInfo(productFormRef)">查询</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

    </el-drawer>
  </div>
</template>

<script lang="ts">
import { FormInstance, ElMessage } from 'element-plus'
import { Download, Search, Expand } from '@element-plus/icons-vue'
import { defineComponent, ref, reactive } from "vue";
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import FormItem from '@/components/ProductFormItem';
import sbomDownloadPop from '@/components/SbomDownloadPop.vue';
import ProductItemConfig from '@/types/ProductItemConfig';
import { productDrawer, OpenProductDrawer, CloseProductDrawer, ParseUriProductName } from '@/utils';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: "App",
  components: {
    FormItem,
    sbomDownloadPop
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

      productDrawer: productDrawer,
      OpenProductDrawer: OpenProductDrawer,
      ParseUriProductName: ParseUriProductName,

      productName: (window as any).SBOM_PRODUCT_NAME ? (window as any).SBOM_PRODUCT_NAME : "" as string,
      productType: "",

      productTypeList: [],
      productConfigList: [] as ProductItemConfig[],

      productForm: reactive({
        data: {},
        rules: {},
      }),

    }
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
              (window as any).SBOM_PRODUCT_NAME = response.data.name;
              CloseProductDrawer();
              this.reload();
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

    handleProductTypeChange(productType: string) {
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
    }

  },

  provide() {
    return {
      reload: this.reload
    }
  },

  mounted() {
    this.getProductTypeList();
    this.productName = this.ParseUriProductName();
  },
});
</script>

<style>
.sbom-service {
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 12px;
  margin-bottom: 12px;
}

.sbom-header {
  margin-left: 20px;
  margin-top: 20px;
}
</style>
