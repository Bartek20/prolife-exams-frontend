import {Component, OnInit} from '@angular/core';
import {UIChart} from 'primeng/chart';
import {Chart} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-response',
  imports: [
    UIChart
  ],
  templateUrl: './response.component.html',
  styleUrl: './response.component.scss'
})
export class ResponseComponent implements OnInit {
  data = {
    labels: ['Poprawne', 'Niepoprawne', 'Brak odpowiedzi'],
    datasets: [
      {
        data: [12, 19, 3],
        backgroundColor: [
          'green',
          'red',
          'gray'
        ],
        hoverOffset: 4
      }
    ]
  }
  options = {
    plugins: {
      annotation: {
        annotations: {
          dLabel: {
            type: 'doughnutLabel',
            content: ({chart}: any) => {
              const { _parsed: data, total } = chart.getDatasetMeta(0);
              const correct = data[0];
              const correctPercentage = ((correct / total) * 100).toFixed(2);
              return [
                correctPercentage + '%',
                correct + '/' + total,
              ]
            },
            font: [
              {
                size: '24px',
                weight: 'bold',
                lineHeight: '1.4',
              },
              {
                size: '18px',
                lineHeight: '1.4'
              }
            ],
            color: ['black', 'rgba(0,0,0,0.5)'],
          }
        }
      },
      legend: {
        display: false
      },
    },
    cutout: '85%',
  };

  plugins = [];
  ngOnInit() {
    Chart.register(annotationPlugin);
  }
}
