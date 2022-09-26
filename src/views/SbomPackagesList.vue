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
              @keyup.enter="search" 
              @blur="search"
            />
          </div>
        </div>
      </div>
      <div class="sbom-table">
        <el-table 
          ref="singleTableRef" 
          :data="pageData"  
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
          <el-table-column fixed property="name" label="软件包名称" width="250" show-overflow-tooltip>
            <template #default="scope">
              <img class="imgIcon" src="@/assets/images/package.png" alt="">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column property="version" label="版本(epoch:version-release)" width="250"
            show-overflow-tooltip
            v-if="IsOpenEulerByProductName()" />
          <el-table-column property="version" label="版本" show-overflow-tooltip width="250" v-else>
            <template #default="scope">
              <img class="imgIcon" src="@/assets/images/package.png" alt="">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column property="licenseConcluded" label="漏洞风险数值" width="550">
            <template #default="scope">
              <template v-for="(vul, vulIndex) in vluProps" :key="vulIndex">
                <div 
                  :class="['vulBtns','vul'+vulIndex]" 
                  v-if="scope.row.statistics && (scope.row.statistics[vul.prop] || scope.row.statistics[vul.prop]===0)"
                  :key="vulIndex"
                >
                  <span class="txt">{{ vul.label }}</span>
                  <span class="num">{{ scope.row.statistics[vul.prop] }}</span> 
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column property="licenseConcluded" label="License" min-width="200" :formatter="NoAssertionFormat">
            <template #default="scope">
              <template v-if="scope.row.licenseConcluded">
                <div 
                  class="licenseItem" 
                  v-for="(license,index) in scope.row.licenseConcluded.split('and')" 
                  :key="index"
                >
                  <span class="dot"></span>
                  <span class="txt">{{ license }}</span>
                </div>
              </template>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column property="supplier" label="Supplier" min-width="200" show-overflow-tooltip :formatter="NoAssertionFormat" />
          <el-table-column fixed="right" width="100" label="更多">
            <template #default="props">
              <router-link :to="'/sbomPackageDetail/' + props.row.id + '/' + getProductName" target="_blank" class="nav-link">详情</router-link>
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
      vluProps: [
        { label: '致命', prop: 'criticalVulCount' },
        { label: '高', prop: 'highVulCount' },
        { label: '中', prop: 'mediumVulCount' },
        { label: '低', prop: 'lowVulCount' },
        { label: '无风险', prop: 'noneVulCount' },
        { label: '未知', prop: 'unknownVulCount' },
      ]

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
      this.search()
    },
    search() {
      this.pageNum = 1
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
          this.totalElements = 0
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