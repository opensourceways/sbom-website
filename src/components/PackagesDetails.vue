<template>
  <div class="sbom-service">

    <el-tabs v-model="activeName" class="details-tabs">
      <el-tab-pane label="SBOM元数据" name="detailsTable">
        <el-table :data="detailsTable" border :show-header="false">
          <el-table-column label="" prop="colName" width="300" />
          <el-table-column label="" prop="colValue" :formatter="NoAssertionFormat" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="软件包依赖" name="binary">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="search-header">
                  <span>Package Info</span>
                  <el-input v-model="searchPackage" class="w-25 m-2" size="small" placeholder="过滤namespace或name"
                    clearable />
                </div>
              </template>
              <div>
                <el-table ref="packageManagerTableRef" :data="filterPackageTable" stripe highlight-current-row
                  height="250" style="width: 100%">
                  <el-table-column fixed type="index" label="PURL" width="100" />
                  <el-table-column fixed property="type" label="包管理类型" width="100" />
                  <el-table-column property="namespace" label="namespace" />
                  <el-table-column property="name" label="name" />
                  <el-table-column property="version" label="version" />
                  <el-table-column property="qualifiers.arch" label="arch" />
                </el-table>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="search-header">
                  <span>Module Info</span>
                  <el-input v-model="searchProvide" class="w-25 m-2" size="small" placeholder="过滤namespace或name"
                    clearable />
                </div>
              </template>
              <div>
                <el-table ref="provideManagerTableRef" :data="filterProvideTable" stripe highlight-current-row
                  height="250" style="width: 100%">
                  <el-table-column fixed type="index" label="PURL" width="100" />
                  <el-table-column fixed property="type" label="包管理类型" />
                  <el-table-column property="namespace" label="namespace" />
                  <el-table-column property="name" label="name" />
                  <el-table-column property="version" label="version" />
                </el-table>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="search-header">
                  <span>Dependency</span>
                  <el-input v-model="searchExternal" class="w-25 m-2" size="small" placeholder="过滤namespace或name"
                    clearable />
                </div>
              </template>
              <div>
                <el-table ref="externalManagerTableRef" :data="filterExternalTable" stripe highlight-current-row
                  max-height="400" style="width: 100%">
                  <el-table-column fixed type="index" label="PURL" width="100" />
                  <el-table-column fixed property="type" label="包管理类型" />
                  <el-table-column property="namespace" label="namespace" />
                  <el-table-column property="name" label="name" />
                  <el-table-column property="version" label="version" />
                </el-table>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div>
                  <span>Runtime Dependency</span>
                </div>
              </template>
              <div class="text item">No Data</div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="License" name="license">
        <el-table :data="licenseTable" border :show-header="false">
          <el-table-column label="" prop="colName" width="300" />
          <el-table-column label="" prop="colValue" :formatter="NoAssertionFormat" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="漏洞" name="vulnerable">漏洞</el-tab-pane>

      <el-tab-pane label="上游社区" name="upstream">上游社区信息</el-tab-pane>

      <el-tab-pane label="Patch" name="patch">patch信息</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import SbomPackage from "@/types/SbomPackage";
import ResponseData from "@/types/ResponseData";
import SbomDataService from "@/services/SbomDataService";
import { NoAssertionFormat, IsOpenEulerBySourceInfo } from "@/utils"

export default defineComponent({
  name: "packageDetails",
  data() {
    return {
      activeName: ref('detailsTable'),

      packageDetails: {} as SbomPackage,
      detailsTable: [] as Map<string, string>[],
      licenseTable: [] as Map<string, string>[],

      licenseDeclared: "",
      licenseConcluded: "",

      packageManagerList: [] as Map<string, any>[],
      provideManagerList: [] as Map<string, any>[],
      externalManagerList: [] as Map<string, any>[],
      searchPackage: "",
      searchProvide: "",
      searchExternal: "",
    };
  },
  methods: {
    queryPackageDetails(packageId: string) {
      SbomDataService.querySbomPackageById(packageId)
        .then((response: ResponseData) => {
          // this.packageDetails = response.data;

          // let detailsTable = new Array(0);
          // detailsTable.push({ "colName": "Name", "colValue": this.packageDetails.name });
          // if (IsOpenEulerBySourceInfo(this.packageDetails)) {
          //   detailsTable.push({ "colName": "Version(epoch:version-release)", "colValue": this.packageDetails.version });
          // } else {
          //   detailsTable.push({ "colName": "Version", "colValue": this.packageDetails.version });
          // }
          // detailsTable.push({ "colName": "Homepage", "colValue": this.packageDetails.homepage });
          // detailsTable.push({ "colName": "Supplier", "colValue": this.packageDetails.supplier });
          // detailsTable.push({ "colName": "Description", "colValue": this.packageDetails.description });
          // detailsTable.push({ "colName": "Summary", "colValue": this.packageDetails.summary });
          // detailsTable.push({ "colName": "Copyright", "colValue": this.packageDetails.copyright });
          // detailsTable.push({ "colName": "License", "colValue": this.packageDetails.licenseConcluded });
          // detailsTable.push({ "colName": "download location", "colValue": this.packageDetails.downloadLocation });
          // detailsTable.push({ "colName": "来源信息", "colValue": this.packageDetails.sourceInfo });
          // this.detailsTable = detailsTable;

          // let licenseTable = new Array(0);
          // licenseTable.push({ "colName": "licenseDeclared", "colValue": this.packageDetails.licenseDeclared });
          // licenseTable.push({ "colName": "licenseConcluded", "colValue": this.packageDetails.licenseConcluded });
          // this.licenseTable = licenseTable;
        })
        .catch((e: Error) => {
          console.error('query package details failed:', { e });
        });
    },

    queryPackageBinary(packageId: string) {
      SbomDataService.queryPackageBinaryManagement(packageId, "ALL")
        .then((response: ResponseData) => {
          this.packageManagerList = response.data.packageList;
          this.provideManagerList = response.data.provideList;
          this.externalManagerList = response.data.externalList;
        })
        .catch((e: Error) => {
          console.error('query package binary failed:', { e });
        });

    },

    NoAssertionFormat,

  },

  computed: {
    filterPackageTable(): Map<string, any>[] {
      return filterTableData(this.searchPackage, this.packageManagerList);
    },
    filterProvideTable(): Map<string, any>[] {
      return filterTableData(this.searchProvide, this.provideManagerList);
    },
    filterExternalTable(): Map<string, any>[] {
      return filterTableData(this.searchExternal, this.externalManagerList);
    },
  },

  mounted() {
    this.queryPackageDetails(this.$route.params.id.toString());
    this.queryPackageBinary(this.$route.params.id.toString());
  },
});

const filterTableData: any = (searchExternal: string, tableDataList: Map<string, any>[]) => {
  let tableData = transferPurl(tableDataList)
  if (tableData.length == 0) {
    return tableData;
  }
  return tableData.filter((data: any) => !searchExternal ||
    String(data.name).toLowerCase().includes(searchExternal.toLowerCase()) ||
    String(data.namespace).toLowerCase().includes(searchExternal.toLowerCase())
  )
}

const transferPurl: any = (list: any) => {
  let purlList: any[] = []
  list.forEach((element: any) => {
    if (element.type === 'purl') {
      purlList.push(element.purl);
    }
  });
  return purlList;
}

</script>


<style scoped>
.details-tabs>.el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
