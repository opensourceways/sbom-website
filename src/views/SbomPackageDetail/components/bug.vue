<template>
  <div class="packageBug-container sbom-container">
    <div class="sbom-table">
      <el-table
        :data="tableData" 
        stripe 
        highlight-current-row 
      >
      <template #empty>
        <div class="no-data">
          <img src="@/assets/images/no-data.png" alt="" />
          <p>暂无相关内容</p>
        </div>
      </template>
      <el-table-column 
        v-for="(col,colIndex) in columns"
        :key="colIndex"
        :label="col.label"
      >
        <template #default="scope">
          <span>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column>
      </el-table>
      <div class="sbom-pagination">
        <el-pagination 
          layout="total, sizes, prev, pager, next, jumper" 
          :page-sizes="[10, 15, 20, 25, 30]"
          :total="pagination.total" 
          :page-size="pagination.pageSize" 
          v-model:page-size="pagination.pageSize" 
          v-model:currentPage="pagination.pageNum"
          @current-change="handlePageChange" 
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
function defaultPagination() {
  return {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
}
export default defineComponent({
  name: "bug",
  components: {
    
  },
  data() {
    return {
      columns: [
        { label: '漏洞编号', prop: 'vulId' },
        { label: '漏洞评分系统', prop: 'scoringSystem' },
        { label: '漏洞评分', prop: 'score' },
        { label: '漏洞评分向量', prop: 'vector' },
        { label: '漏洞关联组件purl', prop: 'purl' },
      ],
      pagination: defaultPagination(),
      tableData: [] as Map<string, any>[]
    };
  },
  methods: {
    handlePageChange(val: number) {
      this.pagination.pageNum = val
      this.queryPackageVulnerability()
    },
    handleSizeChange( val: number) {
      this.pagination.pageNum = 1
      this.pagination.pageSize = val
      this.queryPackageVulnerability()
    },
    queryPackageVulnerability() {
      const packageId: string = this.$route.params.id.toString()
      SbomDataService.queryPackageVulnerability(packageId, this.pagination.pageNum - 1, this.pagination.pageSize)
        .then((response: ResponseData) => {
          this.tableData = response.data.content;
          this.pagination.total = response.data.totalElements;
        })
        .catch((e: Error) => {
          this.pagination.total = 0
          console.error('query package details failed:', { e });
        });
    },
  },
  mounted() {
    this.queryPackageVulnerability();
  },
});
</script>

<style lang="less" scoped>
.packageBug-container{
  padding-top: 20px;
}
</style>