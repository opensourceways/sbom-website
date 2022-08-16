<template>
  <div class="sbom-service">
    <el-form ref="conditionFormRef" :model="conditionForm" :rules="validateRules" label-width="120px" status-icon>
      <el-form-item label="依赖类型" prop="binaryType">
        <el-radio-group v-model="conditionForm.binaryType">
          <el-radio label="PACKAGE_MANAGER">Package</el-radio>
          <el-radio label="PROVIDE_MANAGER">Module</el-radio>
          <el-radio label="EXTERNAL_MANAGER">Dependency</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-row :gutter="1">
        <el-col :span="4">
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
        </el-col>
        <el-col :span="6" v-show="conditionForm.type === 'maven'">
          <el-form-item label="namespace">
            <el-input v-model="conditionForm.namespace" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="name" prop="name">
            <el-input v-model="conditionForm.name" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="version">
            <el-input v-model="conditionForm.version" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="retrieveBinary(conditionFormRef)">Search</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="singleTableRef" :data="pageData" stripe border highlight-current-row max-height="600"
      style="width: 100%">
      <el-table-column fixed type="index" width="70" :index="indexCounter" />
      <el-table-column fixed property="purl" label="依赖描述符（PURL）" width="500" />
      <el-table-column fixed property="name" label="关联软件包名称" width="200" />
      <el-table-column property="version" label="版本" width="200" />
      <el-table-column property="description" label="软件包描述" />
      <el-table-column fixed="right" label="软件包详情" width="120">
        <template #default="props">
          <router-link :to="'/packageDetails/' + props.row.id" target="_blank" class="nav-link">详情</router-link>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next, jumper, sizes, total" :page-sizes="[10, 15, 20, 25, 30]"
      :total="totalElements" :page-size="pageSize" v-model:page-size="pageSize" v-model:currentPage="pageNum"
      @current-change="handlePageChange" @size-change="handleSizeChange" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import type { FormInstance, FormRules } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { IsSelectArtifact } from "@/utils"

export default defineComponent({
  name: "sbom-packages-list",
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

    };
  },
  methods: {
    indexCounter(index: number) {
      return index + (this.pageNum - 1) * this.pageSize + 1;
    },

    transferChildTable(row: any) {
      let childTable = []
      childTable.push({ "colName": "概要", "colValue": row.summary });
      childTable.push({ "colName": "描述", "colValue": row.description });
      childTable.push({ "colName": "Homepage", "colValue": row.homepage });
      childTable.push({ "colName": "来源信息", "colValue": row.sourceInfo });
      return childTable;
    },

    handlePageChange(val: number) {
      this.retrieveBinary(this.conditionFormRef);
    },

    handleSizeChange(val: number) {
      this.retrieveBinary(this.conditionFormRef);
    },

    async retrieveBinary(formEl: FormInstance | undefined) {
      if (!formEl) return;
      if (!IsSelectArtifact()) return;

      await formEl.validate((valid, fields) => {
        if (valid) {
          let requestParam = new FormData()
          requestParam.append('productName', (window as any).SBOM_PRODUCT_NAME)
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
            })
            .catch((e: Error) => {
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
