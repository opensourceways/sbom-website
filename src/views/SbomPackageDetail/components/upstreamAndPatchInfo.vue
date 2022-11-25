<template>
  <div class="upstream-container sbom-container">
    <div 
      class="package-main"
      v-for="(part,partIndex) in config"
      :key="partIndex"
    >
      <div class="package-title">
        <div class="title">
          <img src="@/assets/images/titleIcon2.png" alt="">
          {{ part.title }}
        </div>
        <div class="search">
          <el-input
            placeholder="请输入关键字，按enter键搜索"
            :suffix-icon="Search"
            v-model="search[part.prop]"
            @blur="getData"
            @keyup.enter="getData"
          >
          </el-input>
        </div>
      </div>
      <div class="sbom-table">
        <el-table
          :data="tableData[part.prop]" 
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
          type="index"
          label="序号"
          width="80">
        </el-table-column>
        <el-table-column 
          v-for="(col,colIndex) in columns[part.prop]"
          :key="colIndex"
          :label="col.label"
          show-overflow-tooltip
        >
          <template #default="scope">
            <div v-if="col.link" @click="goPath(scope.row)" :class="{ link: scope.row.url }">{{ scope.row[col.prop] }}</div>
            <span v-else>{{ scope.row[col.prop] }}</span>
          </template>
        </el-table-column>
        </el-table>
        <!-- <div class="sbom-pagination">
          <el-pagination 
            layout="total, sizes, prev, pager, next, jumper" 
            :page-sizes="[10, 15, 20, 25, 30]"
            :total="pagination[part.prop].total" 
            :page-size="pagination[part.prop].pageSize" 
            v-model:page-size="pagination[part.prop].pageSize" 
            v-model:currentPage="pagination[part.prop].pageNum"
            @current-change="(val)=>{ handlePageChange(part.prop,val) }" 
            @size-change="(val)=>{ handleSizeChange(part.prop,val) }"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Search } from '@element-plus/icons-vue'
import ResponseData from "@/types/ResponseData";
import SbomDataService from "@/services/SbomDataService";
import { ElMessage } from 'element-plus';
function defaultPagination() {
  return {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
}
export default defineComponent({
  name: "upstreamAndPatchInfo",
  components: {
    
  },
  data() {
    return {
      Search: Search,
      config: [
        { title: '上游社区', prop: 'upstream' },
        { title: 'Patch', prop: 'patch' },
      ],
      columns: {
        upstream: [
          { label: 'URL', prop: 'url', link: true },
        ],
        patch: [
          { label: 'URL', prop: 'url', link: true },
        ],
      },
      search: {
        upstream: '',
        patch: '',
      },
      pagination: {
        upstream: defaultPagination(),
        patch: defaultPagination(),
      },
      tableData: {
        upstream: [] as Map<string, any>[],
        patch: [] as Map<string, any>[]
      },
      dataList: {
        upstreamList: [] as Map<string, any>[],
        patchList: [] as Map<string, any>[]
      }
    };
  },
  methods: {
    queryUpstreamAndPatchInfo(packageId: string) {
      SbomDataService.queryUpstreamAndPatchInfo(packageId)
        .then((response: ResponseData) => {
          this.dataList = response.data
          this.getData()
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: 'error'
            })
          }
          this.dataList = {
            upstreamList: [] as Map<string, any>[],
            patchList: [] as Map<string, any>[]
          }
        });
    },
    getData() {
      const { upstream, patch } = this.search
      const { upstreamList, patchList } = this.dataList
      this.tableData.upstream = filterTableData(upstream, upstreamList);
      this.tableData.patch =  filterTableData(patch, patchList);
    },
    handlePageChange(prop: string, val: number) {
      console.log(prop,val)
    },
    handleSizeChange(prop: string, val: number) {
      console.log(prop,val)
    },
    goPath(item) {
      if(item.url) {
        window.open(item.url, '_blank')
      }
    }
  },
  mounted() {
    this.queryUpstreamAndPatchInfo(this.$route.params.id.toString());
  },
});

const filterTableData: any = (searchExternal: string, tableDataList: Map<string, any>[]) => {
  return tableDataList.filter((data: any) => !searchExternal ||
    String(data.url).toLowerCase().includes(searchExternal.toLowerCase())
  )
}
</script>

<style lang="less" scoped>
.upstream-container{
  // display: flex;
  // justify-content: space-between;
  // flex-wrap: wrap;
  .package-main{
    width: 100%;
    padding: 20px 0;
    &:first-child{
      border-bottom: 2px dashed #D9E0ED;
    }
    .package-title{
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
      padding: 0 20px;
      .title{
        display: flex;
        height: 32px;
        align-items: center;
        font-size: 16px;
        font-weight: bold;
        color: #000000;
        img{
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
<style lang="less">
.upstream-container{
  .search{
    width: 340px;
    .el-input__inner{
      height: 30px;
      background-color: #FFFFFF;
      border-radius: 4px;
      &::placeholder {
        color: #CFD5E3;
        font-size: 14px;
      }
    }
    .el-icon{
      color: #333;
    }
  }
  .sbom-table{
    padding: 0 20px;
    background-color: #ffffff;
    .el-table{
      .el-table__body-wrapper{
        height: auto;
        overflow: auto;
      }
    }
  }
}
</style>
