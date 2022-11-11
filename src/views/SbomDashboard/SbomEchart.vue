<template>
  <div :id="'echart' + chartId" style="height:100%;">
    <div class="centerBox">
      <el-empty
        :image="emptyImg"
        description="暂无数据"
        style="text-align:center"
      >
      </el-empty>
    </div>
  </div>
</template>
<script>
import { init } from 'echarts'
import { defineComponent, markRaw } from "vue";
import { options, lineAreaStyle, getRich } from './echartOption.ts'

export default defineComponent({
  name: 'SbomEchart',
  props: {
    // option: {
    //   type: Object,
    //   required: true
    // },
    dataList: {
      type: [ Object, Array ],
      default: null
    },
    chartId: {
      type: String,
      default: 'chart'
    },
    chartType: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '100%'
    },
    width: {
      type: String,
      default: '100%'
    },
    props: Object
  },
  data () {
    return {
      emptyImg: require('@/assets/images/no-data.png'),
      chart: null,
      option: options[this.chartType],
      yAxisName: {
        vulnerabilityCounts: '漏洞数：个',
        vulnerabilityComponents: '组件数：个',
        vulnerabilityTrends: '漏洞数：个'
      }
    }
  },
  methods: {
    createDom (id) {
      const div = document.createElement('div')
      div.id = id
      div.style = `height:${this.height};width:${this.width}`
      document.querySelector(`#echart${this.chartId}`).appendChild(div)
    },
    formatBar() {
      const xData = Object.keys(this.dataList)
      let data = []
      xData.map(key => {
        data.push(this.dataList[key])
      })
      const seriesItem = this.option.seriesItem
      let options = { 
        ...this.option,
        series: [{
          ...seriesItem,
          data
        }]
      }
      options.xAxis.data = xData
      options.xAxis.axisLabel.rich = getRich(xData.length)
      options.xAxis.axisLabel.formatter = function(params) {
        let index = xData.findIndex(item => item === params)
        return [
          '{a' + index + '|' + params + '}'
        ].join('\n')
      }
      options.yAxis.name = this.yAxisName[this.chartId]
      return options
    },
    formatTime(timestamp) {
      var date = new Date(timestamp);
      return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' '
    },
    formatLine() {
      let series = []
      let xData = []
      let lengendData =  []
      if(this.dataList && this.dataList) {
        xData = this.dataList.map(item => item.timestamp)
        lengendData = Object.keys(this.props)
        if(lengendData.length) {
          lengendData.map((key,index) => {
            let data = []
            xData.map(x => {
              const d = this.dataList.find(item => item.timestamp === x)
              data.push(d[this.props[key]])
            })
            series.push({
              name: key,
              type: 'line',
              symbol: 'circle',
              symbolSize: 8,
              areaStyle: {
                normal: {
                  color: lineAreaStyle(index)
                }
              },
              data
            })
          })
        }
      }
      
      let options = { 
        ...this.option,
        series
      }
      options.legend.data = lengendData
      options.xAxis.data = xData.map(date => this.formatTime(date))
      options.yAxis.name = this.yAxisName[this.chartId]
      return options
    },
    formatDataList(data) {
      const keys = Object.keys(data)
      if(keys && keys.length < 11) {
        return data
      } else {
        let arr = keys.sort((a,b) => {
          return data[b] - data[a]
        })
        let newObj = {}
        let total = 0
        arr.map((item,itemIndex) => {
          if(itemIndex < 10) {
            newObj[item] = data[item]
          } else {
            total += data[item]
          }
        })
        newObj['其他'] = total
        return newObj
      }
    },
    formatPie() {
      const dataList = this.formatDataList(this.dataList)
      const lengendData = Object.keys(dataList)
      const data = []
      lengendData.length && lengendData.map(key => {
        data.push({
          name: key,
          value: dataList[key]
        })
      })
      const seriesItem = this.option.seriesItem
      let options = { 
        ...this.option,
        series: [{
          ...seriesItem,
          data
        }]
      }
      return options
    },
    chartClick () {
      this.chart.on('click', params => {
        if(params.name) {
          this.$emit('echartsClick', params.name)
        }
      })
    },
    formatGraph() {
      const { nodes, edges} = this.dataList
      const option = {
        tooltip: {
          formatter: function(params) {
            return `<div style="display:block;max-width: 250px;word-break: break-all;word-wrap: break-word;white-space:pre-wrap">${params.name}</div>`
          }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            // progressiveThreshold: 700,
            data: nodes && nodes.map(function (node) {
              return {
                x: node.x,
                y: node.y,
                id: node.id,
                name: node.label,
                symbolSize: node.size,
                itemStyle: {
                  color: node.color
                },
                label:{
                  show: node.nodeType !== 'transitiveDep',
                  position: 'right'
                }
              };
            }),
            edges: edges && edges.map(function (edge) {
              return {
                source: edge.sourceID,
                target: edge.targetID
              };
            }),
            emphasis: {
              focus: 'adjacency',
              label: {
                position: 'right',
                show: false
              }
            },
            roam: true,
            lineStyle: {
              width: 1,
              curveness: 0.3,
            }
          }
        ]
      };
      return option
    },
    initEchart() {
      let options = {}
      if(this.chartType === 'bar') {
        options = this.formatBar()
      } else if(this.chartType === 'line') {
        options = this.formatLine()
      } else if(this.chartType === 'pie') {
        options = this.formatPie()
      } else if(this.chartType === 'graph') {
        options = this.formatGraph()
      }
      this.chart.setOption(options)
      this.chartClick()
    }
  },
  watch: {
    dataList: {
      handler: function (newVal) {
        if (newVal) {
          if (!document.querySelector(`#echart${this.chartId}`)) {
            this.createDom(this.chartId)
          }
          this.chart && this.chart.dispose()
          this.chart = markRaw(init(document.querySelector(`#echart${this.chartId}`)))
          this.chart && this.initEchart()
        } else {
          this.chart && this.chart.dispose()
        }
      },
      deep: true
    }
  },
  mounted () {
    this.chart && this.chart.dispose()
    this.chart = markRaw(init(document.querySelector(`#echart${this.chartId}`)))
    this.chart && this.initEchart()
  },
  beforeUnmount () {
    this.chart = null
  }
});
</script>
<style scoped>
.centerBox {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
