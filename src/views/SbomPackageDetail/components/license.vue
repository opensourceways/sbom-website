<template>
  <div class="sbomData-container">
    <div class="sbomData-part">
      <div class="part-title">
        <img src="@/assets/images/titleIcon2.png" alt="">
        License
      </div>
      <div class="content-box">
        <div class="content">
          <div class="label spe">LicenseDeclared:</div>
          <div class="buttons">
            <template v-if="license.licenseDeclared">
              <div 
                class="item" 
                v-for="(license,index) in license.licenseDeclared.split('and')" 
                :key="index"
              >
                <span class="dot"></span>
                <span class="txt">{{ license }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="content-box">
        <div class="content">
          <div class="label spe">licenseConcluded:</div>
          <div class="buttons">
            <template v-if="license.licenseConcluded">
              <div class="item" v-for="(license,index) in license.licenseConcluded.split('and')" :key="index">
                <span class="dot"></span>
                <span class="txt">{{ license }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="sbomData-part">
      <div class="part-title">
        <img src="@/assets/images/titleIcon2.png" alt="">
        Copyrights
      </div>
      <div class="content-box inline">
        <div class="content">
          <!-- <div class="label">organization:</div><div class="name">{{ license.organization }}</div> -->
          <div class="label">organization:</div><div class="name">http://openeuler.org</div>
        </div>
        <div class="content">
          <!-- <div class="label">Star  Year:</div><div class="name">{{ license.year }}</div> -->
          <div class="label">Star  Year:</div><div class="name">2001</div>
        </div>
        <div class="content">
          <!-- <div class="label">AdditionalZnfo:</div><div class="name">{{ license.additionalZnfo }}</div> -->
          <div class="label">AdditionalZnfo:</div><div class="name">http://hive.apache.org/</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "license",
  components: {
    
  },
  props: {
    license: {
      type: Object,
      default: ()=>{
        return {}
      }
    }
  },
  data() {
    return {
    };
  },
  methods: {
    
  },
});
</script>

<style lang="less" scoped>
.sbomData-container{
  padding: 0 20px;
  .sbomData-part{
    padding: 20px 0;
    border-bottom: 2px dashed #D9E0ED;
    &:last-child{
      border-bottom: none;
    }
    .part-title{
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 10px;
      img{
        margin-right: 10px;
      }
    } 
    .content-box{
      font-size: 14px;
      color: #000000;
      .content{
        display: flex;
        align-items: center;
        margin-top: 10px;
        .label{
          color: #666666;
          margin-right: 10px;
          min-width: 60px;
          &.spe{
            min-width: 115px;
          }
        }
        .buttons{
          display: flex;
          .item{
            height: 32px;
            line-height: 30px;
            padding: 0 10px;
            border: 1px solid #E5E5E5;
            border-radius: 8px;
            font-size: 14px;
            color: #000000;
            margin-right: 10px;
            .dot{
              display: inline-block;
              width: 8px;
              height: 8px;
              background-color: #626CD9;
              border-radius: 50%;
              margin-right: 5px;
            }
          }
        }
      }
      &.inline{
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>
