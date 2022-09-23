<template>
    <div>
        <el-popover ref="popoverRef" popper-class="sbomDownloadPopper" placement="left" trigger="click" @before-enter="openEvent">
            <template #reference>
                <!-- <el-button type="info" :icon="downloadIcon"></el-button> -->
                <div class="downloadBtn">
                    <img src="@/assets/images/download.png" alt="">
                    下载
                </div>
            </template>
            <div class="contentBox">
                <el-select v-model="sbomProtocol" :teleported="false" placeholder="请选择SBOM格式">
                    <el-option label="SPDX" value="spdx-2.2" />
                </el-select>
                <el-select v-model="fileFormat" :teleported="false" placeholder="请选择文件格式">
                    <el-option label="JSON" value="json" />
                    <el-option label="Yaml" value="yaml" />
                    <el-option label="XML" value="xml" />
                </el-select>
                <div class="btns"> 
                    <el-button type="primary" @click="downloadSbom">下载</el-button>
                </div>
            </div>
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

<style lang="less" scoped>
.downloadBtn{
    width: 71px;
    height: 35px;
    background-color: #4A70FF;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    img{
        margin-right: 5px;
    }
}
</style>
<style lang="less">
.el-popover.el-popper.sbomDownloadPopper{
    height: auto;
    background: #FFFFFF;
    box-shadow: 0px 5px 16px 0px rgba(140,140,140,0.25);
    border-radius: 16px;
    padding: 20px;
    min-width: 250px;
    .el-popover__title{
        padding: 0 20px;
        font-size: 18px;
        font-weight: bold;
        color: #191A36;
        margin-bottom: 0px;
    }
    .contentBox{
        .el-select{
            margin-bottom: 20px;
            .el-input__inner{
                height: 36px;
                &::placeholder {
                color: #CFD5E3;
                font-size: 14px;
                }
            }
        }
        .btns{
            display: flex;
            align-items: center;
            justify-content: center;
            .el-button{
                padding: 12px 29px;
                background-color: #4A70FF;
                border-radius: 4px;
                text-align: center;
                font-size: 14px;
                color: #fff;
            }
        }
    }

    
}
</style>
