<template>
  <el-dialog
    title="制品License列表"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    width="70%"
    custom-class="sbom-dialog"
  >
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
          <div v-if="col.link" @click="goPath(scope.row)" :class="{ link: scope.row.licenseUrl }">{{ scope.row[col.prop] }}</div>
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
    
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SbomDataService from "@/services/SbomDataService";
import { mapGetters} from 'vuex';
import ResponseData from "@/types/ResponseData";
function defaultPagination() {
  return {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
}
export default defineComponent({
  name: "SbomLicenseTable",
  data() {
    return {
      dialogVisible: false,
      pagination: defaultPagination(),
      columns: [
        { label: '名称', prop: 'licenseId', link: true },
        { label: '是否合规', prop: 'isLegal' },
        { label: '数量', prop: 'count' },
      ],
      tableData: []
    };
  },
  computed:{
    ...mapGetters([
      'getProductName'
    ])
  },
  methods: {
    handlePageChange(val: number) {
      this.pagination.pageNum = val
      this.getDataList()
    },
    handleSizeChange( val: number) {
      this.pagination.pageNum = 1
      this.pagination.pageSize = val
      this.getDataList()
    },
    goPath(item: any) {
      if(item.licenseUrl) {
        window.open(item.licenseUrl, '_blank')
      }
    },
    getDataList() {
      SbomDataService.queryLicenseUniversalApi(this.getProductName, this.pagination.pageNum - 1, this.pagination.pageSize)
        .then((response: ResponseData) => {
          response.data.content.length && response.data.content.map(item => {
            item.isLegal = item.legal ? '合规' : '不合规'
          })
          this.tableData = response.data.content;
          this.pagination.total = response.data.totalElements;
        })
        .catch((e: Error) => {
          this.pagination.total = 0
          console.error('query package details failed:', { e });
        });
    },
    openDiaog() {
      this.dialogVisible = true
      this.getDataList()
    }
  },
});

</script>


<style scoped>

</style>
