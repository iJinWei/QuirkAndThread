import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { getCSSVariableValue } from '../../../../../../kt/_utils';

@Component({
  selector: 'app-new-charts-widget8',
  templateUrl: './new-charts-widget8.component.html',
  styleUrls: ['./new-charts-widget8.component.scss'],
})
export class NewChartsWidget8Component implements OnInit {
  @ViewChild('weekChart') weekChart: ElementRef<HTMLDivElement>;
  @ViewChild('monthChart') monthChart: ElementRef<HTMLDivElement>;

  @Input() chartHeight: string = '425px';
  @Input() chartHeightNumber: number = 425;
  @Input() cssClass: string = '';
  tab: 'Week' | 'Month' = 'Week';
  chart1Options: any = {};
  chart2Options: any = {};
  hadDelay: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setupCharts();
  }

  init() {
    this.chart1Options = getChart1Options(this.chartHeightNumber);
    this.chart2Options = getChart2Options(this.chartHeightNumber);
  }

  setTab(_tab: 'Week' | 'Month') {
    this.tab = _tab;
    if (_tab === 'Week') {
      this.chart2Options = getChart2Options(this.chartHeightNumber);
    }

    if (_tab === 'Month') {
      this.chart1Options = getChart1Options(this.chartHeightNumber);
    }

    this.setupCharts();
  }

  setupCharts() {
    setTimeout(() => {
      this.hadDelay = true;
      this.init();
      this.cdr.detectChanges();
    }, 100);
  }
}

function getChart1Options(chartHeightNumber: number) {
  const data = [
    [[100, 250, 30]],
    [[225, 300, 35]],
    [[300, 350, 25]],
    [[350, 350, 20]],
    [[450, 400, 25]],
    [[550, 350, 35]],
  ];
  const height = chartHeightNumber;
  const borderColor = getCSSVariableValue('--bs-border-dashed-color');

  const options = {
    series: [
      {
        name: 'Social Campaigns',
        data: data[0], // array value is of the format [x, y, z] where x (timestamp) and y are the two axes coordinates,
      },
      {
        name: 'Email Newsletter',
        data: data[1],
      },
      {
        name: 'TV Campaign',
        data: data[2],
      },
      {
        name: 'Google Ads',
        data: data[3],
      },
      {
        name: 'Courses',
        data: data[4],
      },
      {
        name: 'Radio',
        data: data[5],
      },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'bubble',
      height: height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bubble: {},
    },
    stroke: {
      show: false,
      width: 0,
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 7,
      min: 0,
      max: 700,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: true,
        height: 0,
      },
      labels: {
        show: true,
        trim: true,
        style: {
          colors: getCSSVariableValue('--bs-gray-500'),
          fontSize: '13px',
        },
      },
    },
    yaxis: {
      tickAmount: 7,
      min: 0,
      max: 700,
      labels: {
        style: {
          colors: getCSSVariableValue('--bs-gray-500'),
          fontSize: '13px',
        },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      x: {
        formatter: function (val: string) {
          return 'Clicks: ' + val;
        },
      },
      y: {
        formatter: function (val: string) {
          return '$' + val + 'K';
        },
      },
      z: {
        title: 'Impression: ',
      },
    },
    crosshairs: {
      show: true,
      position: 'front',
      stroke: {
        color: getCSSVariableValue('--bs-border-dashed-color'),
        width: 1,
        dashArray: 0,
      },
    },
    colors: [
      getCSSVariableValue('--bs-primary'),
      getCSSVariableValue('--bs-success'),
      getCSSVariableValue('--bs-warning'),
      getCSSVariableValue('--bs-danger'),
      getCSSVariableValue('--bs-info'),
      '#43CED7',
    ],
    fill: {
      opacity: 1,
    },
    markers: {
      strokeWidth: 0,
    },
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      padding: {
        right: 20,
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };
  return options;
}

function getChart2Options(chartHeightNumber: number) {
  const data = [
    [[125, 300, 40]],
    [[250, 350, 35]],
    [[350, 450, 30]],
    [[450, 250, 25]],
    [[500, 500, 30]],
    [[600, 250, 28]],
  ];
  const height = chartHeightNumber;
  const borderColor = getCSSVariableValue('--bs-border-dashed-color');

  const options = {
    series: [
      {
        name: 'Social Campaigns',
        data: data[0], // array value is of the format [x, y, z] where x (timestamp) and y are the two axes coordinates,
      },
      {
        name: 'Email Newsletter',
        data: data[1],
      },
      {
        name: 'TV Campaign',
        data: data[2],
      },
      {
        name: 'Google Ads',
        data: data[3],
      },
      {
        name: 'Courses',
        data: data[4],
      },
      {
        name: 'Radio',
        data: data[5],
      },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'bubble',
      height: height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bubble: {},
    },
    stroke: {
      show: false,
      width: 0,
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 7,
      min: 0,
      max: 700,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: true,
        height: 0,
      },
      labels: {
        show: true,
        trim: true,
        style: {
          colors: getCSSVariableValue('--bs-gray-500'),
          fontSize: '13px',
        },
      },
    },
    yaxis: {
      tickAmount: 7,
      min: 0,
      max: 700,
      labels: {
        style: {
          colors: getCSSVariableValue('--bs-gray-500'),
          fontSize: '13px',
        },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      x: {
        formatter: function (val: string) {
          return 'Clicks: ' + val;
        },
      },
      y: {
        formatter: function (val: string) {
          return '$' + val + 'K';
        },
      },
      z: {
        title: 'Impression: ',
      },
    },
    crosshairs: {
      show: true,
      position: 'front',
      stroke: {
        color: getCSSVariableValue('--bs-border-dashed-color'),
        width: 1,
        dashArray: 0,
      },
    },
    colors: [
      getCSSVariableValue('--bs-primary'),
      getCSSVariableValue('--bs-success'),
      getCSSVariableValue('--bs-warning'),
      getCSSVariableValue('--bs-danger'),
      getCSSVariableValue('--bs-info'),
      '#43CED7',
    ],
    fill: {
      opacity: 1,
    },
    markers: {
      strokeWidth: 0,
    },
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      padding: {
        right: 20,
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };
  return options;
}
