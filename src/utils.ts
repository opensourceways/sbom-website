import { ElLoading, ElMessage } from 'element-plus'
import ResponseData from "@/types/ResponseData";
import SbomPackage from "@/types/SbomPackage";
import { ref } from "vue";
import $store from "@/store/index";

export function ParseFileNameFromHeader(response: ResponseData) {
    const contentDispositionArr = response.headers['content-disposition']?.split('attachment;filename=');
    return contentDispositionArr.length == 2 ? contentDispositionArr[1] : "";
}

let loadingInstance: any = null;

export function ShowLoading(loadingText = "") {
    loadingInstance = ElLoading.service({
        fullscreen: true,
        text: loadingText
    });
}
export function ShowFullScreenLoading(loadingText = "") {
    loadingInstance = ElLoading.service({
        fullscreen: true,
        text: loadingText,
        background: 'rgba(0, 0, 0, 0.7)',
        customClass: 'loading-win'
    });
}

export function HideLoading() {
    // const loadingInstance = ElLoading.service();
    loadingInstance && loadingInstance.close();
}

export function IsSelectArtifact(): boolean {
    // const productName = (window as any).SBOM_PRODUCT_NAME;
    const productName = $store.state.productName;
    if (productName == null || productName == undefined || productName == "") {
        ElMessage({
            showClose: true,
            message: '请先选择制品信息',
            type: 'warning',
        })
        OpenProductDrawer();
        return false;
    }
    return true;
}

export function NoAssertionFormat(row: any, colum: any, cellValue: string, index: any): string {
    if (!cellValue) {
        return cellValue;
    }

    if (cellValue.toUpperCase() === 'NOASSERTION' || cellValue.toUpperCase() === 'NONE') {
        return ''
    };
    return cellValue;
}

export const productDrawer = ref(false);

export function OpenProductDrawer(): void {
    productDrawer.value = true;
}

export function CloseProductDrawer(): void {
    productDrawer.value = false;
}

export function IsOpenEulerByProductName(): boolean {
    const productName = (window as any).SBOM_PRODUCT_NAME;
    // const productName = $store.state.productName;
    if (!productName) {
        return false;
    }
    return stringIncludeIgnoreCase(productName, 'openEuler');
}

export function IsOpenEulerBySourceInfo(pkgInfo: SbomPackage): boolean {
    if (!pkgInfo) {
        return false;
    }
    return stringIncludeIgnoreCase(pkgInfo.sourceInfo, 'repodata');
}

function stringIncludeIgnoreCase(targetString: string, searchString: string) {
    if (!targetString) {
        return false;
    }
    if (!searchString) {
        return false;
    }

    return targetString.toLowerCase().includes(searchString.toLowerCase());
}

function parseUriParams(): URLSearchParams {
    const paramsStr = window.location.hash.split('?');
    if (!paramsStr || paramsStr.length < 2) {
        return new URLSearchParams();
    }
    return new URLSearchParams(paramsStr[1]);
}

export function ParseUriProductName(): string {
    const searchParams: URLSearchParams = parseUriParams()
    const productName: string = searchParams.get('productName') || '';

    if (productName && !(window as any).SBOM_PRODUCT_NAME) {
        (window as any).SBOM_PRODUCT_NAME = productName;
        return productName;
    } else {
        return (window as any).SBOM_PRODUCT_NAME;
    }
}

const vulSeverityList = [
    { label: '不涉及', prop: 'NA' },
    { label: '未知漏洞', prop: 'UNKNOWN' },
    { label: '无风险漏洞', prop: 'NONE' },
    { label: '低危漏洞', prop: 'LOW' },
    { label: '中危漏洞', prop: 'MEDIUM' },
    { label: '高危漏洞', prop: 'HIGH' },
    { label: '致命漏洞', prop: 'CRITICAL' },
]
export function formatVulSeverity(param:string) {
    let val = ''
    if(param) {
        const tmp = vulSeverityList.find(item => item.label.includes(param))
        if(tmp) {
            val = tmp.prop
        }
    }
    return val
}

export { vulSeverityList }