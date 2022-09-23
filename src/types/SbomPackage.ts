export default interface SbomPackage {
  
  id: null;

  name: string;

  version: string;

  supplier: string;

  description: string;

  copyright: string;

  summary: string;

  homepage: string;

  spdxId: string;

  downloadLocation: string;

  filesAnalyzed: boolean;

  licenseConcluded: string;

  licenseDeclared: string;

  sourceInfo: string;

  sbom_id: string;

  vulList: {}

}