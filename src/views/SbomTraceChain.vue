<template>
  <div class="sbom-container">
    <div class="sbom-main">
      <div class="table-top">
        <div class="table-title">
          · 反向追溯链
        </div>
      </div>
      <div class="table-form">
        <el-form ref="conditionFormRef" class="query-list" :model="conditionForm" :rules="validateRules" label-width="auto" status-icon>
          <el-form-item label="依赖类型" prop="binaryType">
            <el-select v-model="conditionForm.binaryType">
              <el-option label="Package" value="PACKAGE_MANAGER"></el-option>
              <el-option label="Module" value="PROVIDE_MANAGER"></el-option>
              <el-option label="Dependency" value="EXTERNAL_MANAGER"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="包管理器类型" prop="type">
            <el-select v-model="conditionForm.type" placeholder="请选择包管理器类型">
              <el-option label="RPM" value="rpm" />
              <el-option label="Maven" value="maven" />
              <el-option label="Pypi" value="pypi" />
              <el-option label="Gitee" value="gitee" />
              <el-option label="Github" value="github" />
              <el-option label="Gitlab" value="gitlab" />
            </el-select>
          </el-form-item>
          <el-form-item label="namespace">
            <el-input v-model="conditionForm.namespace" clearable />
          </el-form-item>
          <el-form-item label="name" prop="name">
            <el-input v-model="conditionForm.name" clearable />
          </el-form-item>
          <el-form-item label="version">
            <el-input v-model="conditionForm.version" clearable />
          </el-form-item>
          <el-button type="primary" @click="search(conditionFormRef)">搜索</el-button>
        </el-form>
      </div>
      <div class="sbom-table" v-loading="loading">
        <el-table 
          ref="singleTableRef" 
          :data="pageData" 
          stripe
          border
          highlight-current-row 
        >
          <template #empty>
            <div class="no-data">
              <img src="@/assets/images/no-data.png" alt="" />
              <p>暂无相关内容</p>
            </div>
          </template>
          <el-table-column fixed type="index" label="编号" width="70" :index="indexCounter" />
          <el-table-column property="purl" show-overflow-tooltip label="依赖描述符（PURL）" min-width="500">
            <template #default="scope">
              <span>{{scope.row.purl}}</span>
            </template>
          </el-table-column>
          <el-table-column property="name" show-overflow-tooltip label="关联软件包名称" width="200" >
            <template #default="scope">
              <span>{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column property="version" label="版本" width="200" />
          <el-table-column property="description" show-overflow-tooltip label="软件包描述" min-width="500">
            <template #default="scope">
              <span>{{scope.row.description}}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" show-overflow-tooltip label="更多" width="100">
            <template #default="props">
              <router-link :to="'/sbomPackageDetail/' + props.row.id + '/' + isOpenEuler + '/' + getProductName" target="_blank" class="nav-link">详情</router-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="sbom-pagination">
          <el-pagination 
            layout="total, sizes, prev, pager, next, jumper" 
            :page-sizes="[10, 15, 20, 25, 30]"
            :total="totalElements" 
            :page-size="pageSize" 
            v-model:page-size="pageSize" 
            v-model:currentPage="pageNum"
            @current-change="handlePageChange" 
            @size-change="handleSizeChange" 
          />
        </div>
      </div>
    </div>

    
    
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import type { FormInstance, FormRules } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { IsSelectArtifact } from "@/utils"
import { mapGetters} from 'vuex';

export default defineComponent({
  name: "sbom-packages-list",
  components: {
  },
  setup() {
    const conditionFormRef = ref<FormInstance>();
    const validateRules = reactive<FormRules>({
      binaryType: [
        {
          required: true,
          message: '请选择依赖类型',
          trigger: 'change',
        },
      ],
      type: [
        {
          required: true,
          message: '请选择包管理器类型',
          trigger: 'change',
        },
      ],
      name: [
        {
          required: true,
          message: '请输入Name',
          trigger: 'blur'
        },
      ],
    })

    return {
      conditionFormRef,
      validateRules,
    }
  },

  data() {
    return {
      pageData: [],
      pageNum: ref(1),
      pageSize: ref(10),
      totalElements: ref(0),
      Search: Search,

      conditionForm: reactive({
        binaryType: '',
        type: '',
        namespace: '',
        name: '',
        version: '',
      }),
      isOpenEuler: false,
      loading: false
    };
  },
  computed:{
    ...mapGetters([
      'getProductName'
    ])
  },
  watch: {
    getProductName(newVal) {
      this.retrieveBinary(this.conditionFormRef)
      this.isOpenEuler = newVal && newVal.includes('openEuler')
    }
  },
  methods: {
    indexCounter(index: number) {
      return index + (this.pageNum - 1) * this.pageSize + 1;
    },

    handlePageChange(val: number) {
      this.retrieveBinary(this.conditionFormRef);
    },

    handleSizeChange(val: number) {
      this.search();
    },
    
    search() {
      this.pageNum = 1
      this.retrieveBinary(this.conditionFormRef)
    },

    async retrieveBinary(formEl: FormInstance | undefined) {
      if (!formEl) return;
      if (!IsSelectArtifact()) {
        this.pageData = []
        return; 
      }

      await formEl.validate((valid, fields) => {
        if (valid) {
          this.loading = true
          let requestParam = new FormData()
          // requestParam.append('productName', (window as any).SBOM_PRODUCT_NAME);
          requestParam.append('productName', this.getProductName);
          requestParam.append('binaryType', this.conditionForm.binaryType);
          requestParam.append('type', this.conditionForm.type);
          requestParam.append('namespace', this.conditionForm.namespace);
          requestParam.append('name', this.conditionForm.name);
          requestParam.append('version', this.conditionForm.version);
          requestParam.append('page', String(this.pageNum - 1))
          requestParam.append('size', String(this.pageSize))

          SbomDataService.querySbomPackagesByBinary(requestParam)
            .then((response: ResponseData) => {
              this.pageData = response.data.content;
              this.totalElements = response.data.totalElements;
              this.loading = false
            })
            .catch((e: Error) => {
              this.totalElements = 0
              this.loading = false
              console.error('query sbom packages by binary failed:', { e });
            });
        }
      })
    },

  },
  mounted() {
    this.retrieveBinary(undefined);
  },
});
</script>
