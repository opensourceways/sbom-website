import * as echarts from 'echarts';
const color: Array<string> = [
  '#FF0000',
  '#D54656',
  '#FF9126',
  '#EFCE18',
  '#67D68C',
  '#B5E1FF',
  '#BDBFD1',
]
const pieColors: Array<string> = [
  '#1330A0',
  '#466BEB',
  '#5A94F8',
  '#6DBFF9',
  '#C2C4DE',
]

function hexToRgba(hex:string, opacity:number){
  let rgbaColor = "";
  const reg = /^#[\da-f]{6}$/i;
  if (reg.test(hex)) {
      rgbaColor = `rgba(${parseInt("0x" + hex.slice(1, 3))},${parseInt(
    "0x" + hex.slice(3, 5)
  )},${parseInt("0x" + hex.slice(5, 7))},${opacity})`;
  }
  return rgbaColor;
}
function getRich(){
  const richList = {}
  for(let i = 0; i< color.length;i ++) {
    richList['a' + i] = {
      backgroundColor: color[i],
      margin: 20,
      color: '#fff',
      width: 42,
      height: 20,
      fontSize:12,
      verticalAlign: 'middle',
      align: 'center'
    }
  }
  return richList
}

export function lineAreaStyle(index: number) {
  return new echarts.graphic.LinearGradient(
    0, 0, 0, 1,
    [{
        offset: 0,
        color: hexToRgba(color[index], 0.3)
      },
      {
        offset: 1,
        color: hexToRgba(color[0], 0.1)
      }
    ],
    false
  )
}

const options = {
  bar: {
    grid: {
      left: '10%',
      right: 50
    },
    color: '#5A94F8',
    xAxis: {
      type: 'category',
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#E5E5E5'
        }
      },
      axisLabel: {
        rich: getRich()
      },
      data: []
    },
    yAxis: {
      type: 'value',
      name: '单位：个数',
      splitLine: {
        show: false
      },
      axisLabel: {
        color: '#999999',
        fontSize: 14
      }
    },
    seriesItem: {
      barWidth: 42,
      type: 'bar',
      label: {
        show: true,
        position: 'top',
      }
    }
  },
  pie: {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '20%',
      right: '20%',
      orient: 'vertical'
    },
    color: pieColors,
    seriesItem: {
      name: '',
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}：{d}%',
      },
      labelLine: {
        show: true,
        normal: {
          length: 20,
          length2: 30,
          lineStyle: {
            width: 1
          }
        }
      }
    },
    series: []
  },
  line: {
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    color: color,
    legend: {
      data: [],
      bottom: 20,
      itemWidth: 20,
      itemHeight: 10,
      itemGap: 100,
      padding: 10,
      icon: 'roundRect'
    },
    grid: {
      left: 50,
      right: 50,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#E5E5E5'
        }
      },
      axisLabel: {
        color: '#333333'
      },
      data: []
    },
    yAxis: {
      type: 'value',
      name: '问题数：个数',
      splitLine: {
        show: false
      },
    },
    series: []
  },
}

export { options }
