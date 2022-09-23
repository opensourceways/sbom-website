import { createStore } from 'vuex'
interface SbomStore {
  productName: string;
}
export default createStore({
  state: {
    productName: ''
  },
  getters: {
    getProductName: (state: SbomStore) => {
      return state.productName;
    }
  },
  mutations: {
    setProductName(state: SbomStore, productName: string): void {
      state.productName = productName;
    }
  },
  actions: {
  },
  modules: {
  }
})