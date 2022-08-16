<template>
  <div class="sbom-service">
    <el-row :gutter="20">
      <el-col :span="1.5">
        <div class="grid-content ep-bg-purple">
          <span>Package名称：</span>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content ep-bg-purple">
          <el-input v-model="packageName" placeholder="输入查询内容" :prefix-icon="Search" clearable
            @keyup.enter="retrievePackages" />
        </div>
      </el-col>
      <el-col :span="1.5">
        <div class="grid-content ep-bg-purple">
          <span>精准查询：</span>
        </div>
      </el-col>
      <el-col :span="1">
        <div class="grid-content ep-bg-purple">
          <el-switch v-model="isExactly" inline-prompt size="large" active-text="是" inactive-text="否" />
        </div>
      </el-col>

      <el-col :span="1" :offset="1">
        <div class="grid-content ep-bg-purple">
          <el-button type="primary" :icon="Search" @click="retrievePackages">Search</el-button>
        </div>
      </el-col>
    </el-row>

    <el-table ref="singleTableRef" :data="pageData" stripe border highlight-current-row max-height="700"
      style="width: 100%">
      <el-table-column fixed type="index" width="70" :index="indexCounter" />
      <el-table-column fixed property="name" label="软件包名称" width="300" />
      <el-table-column property="version" label="版本(epoch:version-release)" width="300"
        v-if="IsOpenEulerByProductName()" />
      <el-table-column property="version" label="版本" width="300" v-else />
      <el-table-column property="licenseConcluded" label="License" :formatter="NoAssertionFormat" />
      <el-table-column property="copyright" label="Copyright" :formatter="NoAssertionFormat" />
      <el-table-column property="supplier" label="Supplier" width="300" :formatter="NoAssertionFormat" />
      <el-table-column fixed="right" width="120">
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
import { defineComponent, ref } from "vue";
import { Search } from '@element-plus/icons-vue'
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { IsSelectArtifact, NoAssertionFormat, IsOpenEulerByProductName } from "@/utils"

export default defineComponent({
  name: "sbom-packages-list",
  data() {
    return {
      packageName: "",
      isExactly: false,
      pageData: [],
      pageNum: ref(1),
      pageSize: ref(10),
      totalElements: ref(0),
      Search: Search,

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
      this.retrievePackages();
    },

    handleSizeChange(val: number) {
      this.retrievePackages();
    },

    retrievePackages() {
      if (!IsSelectArtifact()) return;

      let requestParam = new FormData()
      requestParam.append('productName', (window as any).SBOM_PRODUCT_NAME);
      requestParam.append('page', String(this.pageNum - 1));
      requestParam.append('size', String(this.pageSize));

      if (this.packageName) {
        requestParam.append('packageName', String(this.packageName))
        requestParam.append('isExactly', String(this.isExactly))
      }

      SbomDataService.querySbomPackagesByPageable(requestParam)
        .then((response: ResponseData) => {
          this.pageData = response.data.content;
          this.totalElements = response.data.totalElements;
        })
        .catch((e: Error) => {
          console.error('query sbom packages pageable failed:', { e });
        });
    },

    NoAssertionFormat,

    IsOpenEulerByProductName,

  },
  mounted() {
    this.retrievePackages();
  },
});
</script>
