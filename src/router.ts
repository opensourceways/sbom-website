import { createWebHashHistory, createRouter } from "vue-router";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: 'sbomPackages'
  },
  {
    path: "/sbomDashboard",
    name: "sbomDashboard",
    component: () => import("@/views/SbomDashboard/SbomDashboard.vue"),
  },
  {
    path: "/sbomPackages",
    name: "sbomPackages",
    component: () => import("@/views/SbomPackagesList.vue"),
  },
  {
    path: "/sbomTraceChain",
    name: "sbomTraceChain",
    component: () => import("@/views/SbomTraceChain.vue"),
  },
  // {
  //   path: "/packageDetails/:id",
  //   name: "package-details",
  //   component: () => import("@/components/PackagesDetails.vue"),
  // },
  {
    path: "/sbomPackageDetail/:id",
    name: "sbomPackageDetail",
    component: () => import("@/views/SbomPackageDetail/SbomPackageDetail.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
