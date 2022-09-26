<template>
  <div class="packageBug-container sbom-container">
    <div class="sbom-table">
      <el-table
        :data="tableData" 
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
      <el-table-column 
        v-for="(col,colIndex) in columns"
        :key="colIndex"
        :label="col.label"
        :width="col.width"
        :show-overflow-tooltip="col.showTooltip"
      >
        <template #default="scope">
          <div v-if="col.link" @click="goPath(scope.row)" class="link">{{ scope.row[col.prop] }}</div>
          <div v-else-if="col.hasBgcolor" :class="['bgColor', formatCellColor(scope.row[col.prop])]">{{ scope.row[col.prop] }}</div>
          <span v-else>{{ scope.row[col.prop] }}</span>
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
        { label: '漏洞编号', prop: 'vulId', link: true, width: 250 },
        { label: '漏洞评分系统', prop: 'scoringSystem', width: 250 },
        { label: '漏洞评分', prop: 'score', width: 250, hasBgcolor: true },
        { label: '漏洞评分向量', prop: 'vector', width: 400, showTooltip: true },
        { label: '漏洞关联组件purl', prop: 'purl', showTooltip: true },
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
    goPath(item: any) {
      if(item.references && item.references.length) {
        const url = item.references[0].second
        window.open(url, '_blank')
      }
    },
    formatCellColor(score: number) {
      if(score <= 0) {
        return 'none'
      }else if(score > 0 && score < 4) {
        return 'low'
      }else if(score >= 4 && score < 7) {
        return 'medium'
      }else if(score >= 7 && score < 9) {
        return 'high'
      }else if(score >= 9) {
        return 'critical'
      } else {
        return ''
      }
    }
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