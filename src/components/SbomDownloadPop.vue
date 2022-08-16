<template>
    <div style="display: flex; align-items: center">
        <el-popover ref="popoverRef" placement="left" trigger="click" :width="300" @before-enter="openEvent">
            <template #reference>
                <el-button type="info" :icon="downloadIcon"></el-button>
            </template>

            <el-row>
                <el-col :span="24">
                    <el-select v-model="sbomProtocol" :teleported="false" placeholder="请选择SBOM格式">
                        <el-option label="SPDX" value="spdx-2.2" />
                    </el-select>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-select v-model="fileFormat" :teleported="false" placeholder="请选择文件格式">
                        <el-option label="JSON" value="json" />
                        <el-option label="Yaml" value="yaml" />
                        <el-option label="XML" value="xml" />
                    </el-select>
                </el-col>
            </el-row>
            <el-row class="last-child">
                <el-col :span="1" :offset="18">
                    <el-button type="primary" @click="downloadSbom">下载</el-button>
                </el-col>
            </el-row>
        </el-popover>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { ParseFileNameFromHeader, ShowLoading, HideLoading, IsSelectArtifact } from '@/utils';

export default defineComponent({
    name: "sbomDownloadPop",
    props: {
        productName: String,
    },
    setup() {
        const popoverRef = ref(null) as any;
        return {
            popoverRef
        }
    },
    data() {
        return {
            downloadIcon: Download,
            IsSelectArtifact: IsSelectArtifact,

            fileFormat: ref(''),
            sbomProtocol: ref(''),
        };
    },
    methods: {
        openEvent() {
            if (!IsSelectArtifact()) {
                this.popoverRef.hide();
            }
            this.fileFormat = "";
            this.sbomProtocol = "";
        },

        downloadSbom() {
            if (!this.sbomProtocol) {
                ElMessage({
                    showClose: true,
                    message: '请选择SBOM格式',
                    type: 'warning',
                })
                return
            }
            if (!this.fileFormat) {
                ElMessage({
                    showClose: true,
                    message: '请选择文件格式',
                    type: 'warning',
                })
                return
            }

            ShowLoading('文件生成中....');

            let sbomType: string[] = this.sbomProtocol.split('-');
            let requestParam = new FormData()
            requestParam.append('productName', this.productName as string)
            requestParam.append('spec', sbomType[0]);
            requestParam.append('specVersion', sbomType[1]);
            requestParam.append('format', this.fileFormat);
            SbomDataService.exportSbom(requestParam)
                .then((response: ResponseData) => {
                    HideLoading();

                    let fileName = ParseFileNameFromHeader(response);
                    var fileURL = window.URL.createObjectURL(new Blob([response.data]));
                    var fileLink = document.createElement('a');
                    fileLink.href = fileURL;
                    fileLink.setAttribute('download', fileName);
                    document.body.appendChild(fileLink);
                    fileLink.click();
                    this.popoverRef.hide();
                })
                .catch((e: Error) => {
                    HideLoading();
                    console.error('download sbom failed:', { e });
                });
        },
    },
});
</script>

<style scoped>
.el-row {
    margin-bottom: 20px;
}

.last-child {
    margin-bottom: 0;
}
</style>
