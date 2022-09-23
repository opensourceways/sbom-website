<template>
  <div class="sbom-container">
    <div class="sbom-main">
      <div class="table-top">
        <div class="table-title">
          · 软件成分数据
        </div>
        <div class="query-list">
          <div class="query-item">
            是否精准查询：
            <el-switch v-model="isExactly" @change="retrievePackages" inline-prompt size="large" active-text="是" inactive-text="否" />
          </div>
          <div class="query-item">
            <el-input 
              v-model="packageName" 
              placeholder="输入package名称搜索" 
              :prefix-icon="Search"
              @keyup.enter="retrievePackages" 
              @blur="retrievePackages"
            />
          </div>
        </div>
      </div>
      <div class="sbom-table">
        <el-table 
          ref="singleTableRef" 
          :data="pageData" 
          stripe 
          highlight-current-row 
        >
          <template #empty>
            <div class="no-data">
              <img src="@/assets/images/no-data.png" alt="" />
              <p>暂无相关内容</p>
            </div>
          </template>
          <el-table-column fixed type="index" label="编号" width="70" :index="indexCounter" />
          <el-table-column fixed property="name" label="软件包名称" width="300" />
          <el-table-column property="version" label="版本(epoch:version-release)" width="300"
            v-if="IsOpenEulerByProductName()" />
          <el-table-column property="version" label="版本" width="300" v-else />
          <el-table-column property="licenseConcluded" label="License" :formatter="NoAssertionFormat" />
          <el-table-column property="copyright" label="Copyright" :formatter="NoAssertionFormat" />
          <el-table-column property="supplier" label="Supplier" width="300" :formatter="NoAssertionFormat" />
          <el-table-column fixed="right" width="100" label="操作">
            <template #default="props">
              <router-link :to="'/sbomPackageDetail/' + props.row.id" target="_blank" class="nav-link">详情</router-link>
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
import { defineComponent, ref } from "vue";
import { Search } from '@element-plus/icons-vue'
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { IsSelectArtifact, NoAssertionFormat, IsOpenEulerByProductName } from "@/utils"
import { mapGetters} from 'vuex';

export default defineComponent({
  name: "sbom-packages-list",
  components: {
  },
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
  computed:{
    ...mapGetters([
      'getProductName'
    ])
  },
  watch: {
    getProductName() {
      this.retrievePackages();
    }
  },
  methods: {
    indexCounter(index: number) {
      return index + (this.pageNum - 1) * this.pageSize + 1;
    },

    handlePageChange(val: number) {
      this.retrievePackages();
    },

    handleSizeChange(val: number) {
      this.retrievePackages();
    },

    retrievePackages() {
      if (!IsSelectArtifact()) { 
        this.pageData = []
        return; 
      }

      let requestParam = new FormData()
      // requestParam.append('productName', (window as any).SBOM_PRODUCT_NAME);
      requestParam.append('productName', this.getProductName);
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

<style lang="less">

</style>