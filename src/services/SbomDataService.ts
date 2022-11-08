import http from "@/http-common";
import { SERVER_API_HOST } from "@/http-common";
import { ResponseType, AxiosRequestConfig } from "axios";
class SbomDataService {

  queryProductType(): Promise<any> {
    return http({
      url: `/queryProductType`,
      method: 'get',
      headers: {
        hideLoading: true 
      }
    })
  }

  queryProductConfig(productType: string): Promise<any> {
    return http({
      url: `/queryProductConfig/${productType}`,
      method: 'get',
      headers: {
        hideLoading: true 
      }
    })
  }

  queryProduct(productType: string, data: any): Promise<any> {
    return http.post(`/queryProduct/${productType}`, data);
  }

  querySbomPackagesByPageable(data: any): Promise<any> {
    return http.post("/querySbomPackages", data);
  }

  querySbomPackageById(packageId: string): Promise<any> {
    return http.get(`/querySbomPackage/${packageId}`);
  }

  queryPackageBinaryManagement(packageId: string, binaryType: string): Promise<any> {
    return http.get(`/queryPackageBinaryManagement/${packageId}/${binaryType}`);
  }

  querySbomPackagesByBinary(data: any): Promise<any> {
    return http.post(`/querySbomPackagesByBinary`, data);
  }

  exportSbom(data: any): Promise<any> {
    const config = {
      baseURL: SERVER_API_HOST + `/sbom-api`,
      headers: {
        "Content-type": "*/*",
        "Accept": "application/octet-stream"
      },
      responseType: "blob" as ResponseType,
    } as AxiosRequestConfig;

    return http.post(`/exportSbom`, data, config);
  }

  queryProductStatistics(productName: string): Promise<any> {
    return http.get(`/queryProductStatistics/${productName}`);
  }

  queryProductVulTrend(productName: string, startTimestamp: number, endTimestamp: number): Promise<any> {
    return http.get(`/queryProductVulTrend/${productName}?startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`);
  }
  queryPackageVulsById(packageId: string): Promise<any> {
    return http.get(`/queryPackageStatistics/${packageId}`);
  }
  queryVulnerability(productName: string, str: string): Promise<any> {
    return http.get(`/queryVulnerability/${productName}?${str}`);
  }
  queryPackageVulnerability(packageId: string, page: number, size: number): Promise<any> {
    return http.get(`/queryPackageVulnerability/${packageId}?page=${page}&size=${size}`);
  }
  queryPackageLicenseAndCopyright(packageId: string): Promise<any> {
    return http.get(`/queryPackageLicenseAndCopyright/${packageId}`);
  }
  queryLicenseUniversalApi(productName: string, page: number, size: number): Promise<any> {
    return http.get(`/queryLicenseUniversalApi?productName=${productName}&page=${page}&size=${size}`);
  }
  queryVulImpact(productName: string, vulId: string): Promise<any> {
    return http.get(`/queryVulImpact/${productName}?vulId=${vulId}`);
  }
}

export default new SbomDataService();
