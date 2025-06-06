import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TeacherService} from '../../../services/teacher.service';
import {Card} from 'primeng/card';
import {UIChart} from 'primeng/chart';
import {SelectButton, SelectButtonChangeEvent} from 'primeng/selectbutton';
import {ProgressSpinner} from 'primeng/progressspinner';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-usage-chart',
  imports: [
    Card,
    UIChart,
    SelectButton,
    ProgressSpinner,
    FormsModule,
    Button
  ],
  templateUrl: './usage-chart.component.html',
  styleUrl: './usage-chart.component.scss'
})
export class UsageChartComponent implements OnInit, OnDestroy {
  @Input() examId!: number;

  statsMode: 'week' | 'month' | 'year' = 'week';
  statsDate!: Date;
  examStats: any;

  parsedStats: any = {
    labels: [],
    datasets: [
      {
        label: 'Rozpoczęte egzaminy',
        data: [],
        backgroundColor: '#42A5F5',
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: 'Zakończone egzaminy',
        data: [],
        backgroundColor: '#66BB6A',
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: 'Nieukończone egzaminy',
        data: [],
        backgroundColor: '#FFA726',
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
      }
    ]
  }
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Statystyki egzaminu',
        font: {
          size: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
  }
  ariaLabel = ''

  loading = true;

  constructor(private teacherService: TeacherService) {
  }

  getStats(showLoading = true) {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    let date = this.statsDate.toISOString().split('T')[0];

    switch (this.statsMode) {
      case "week":
        break;
      case "month":
        date = date.slice(0, 7);
        break;
      case "year":
        date = date.slice(0, 4);
        break;
    }

    date = date.replaceAll('-', '/');

    if (showLoading) {
      this.loading = true;
    }
    this.teacherService.getStats(this.examId, date).subscribe({
      next: data => {
        this.examStats = data;
        this.parseData()
        this.loading = false;
        this.chart?.refresh()
        this.timer = window.setTimeout(() => {
          this.getStats(false);
        }, 30000);
      },
      error: () => {
        this.loading = false;
        this.timer = window.setTimeout(() => {
          this.getStats(false);
        }, 5000);
      }
    })
  }
  parseTitle() {
    const startDate = this.statsDate
    const endDate = new Date(this.statsDate);
    let title = ''
    switch (this.statsMode) {
      case "week":
        const date = (d: Date) => {
          return d.toISOString().split('T')[0].split('-').reverse().join('/');
        }
        endDate.setDate(endDate.getDate() + 6);
        title += date(startDate);
        title += ' - '
        title += date(endDate);
        break;
      case "month":
        const month = (d: Date) => {
          return d.toLocaleString('default', {month: 'long'});
        }
        title += month(startDate);
        title += ' '
        title += startDate.toISOString().split('T')[0].slice(0, 4);
        break;
      case "year":
        title += 'rok '
        title += startDate.toISOString().split('T')[0].slice(0, 4);
        break;
    }
    this.chartOptions.plugins.title.text = title.charAt(0).toUpperCase() + title.slice(1);
    this.ariaLabel = `Statystyki egzaminu z ${title}`;
  }
  parseData() {
    this.parsedStats.labels = Object.keys(this.examStats)
    this.parsedStats.datasets[0].data = Object.values(this.examStats).map((item: any) => item.created)
    this.parsedStats.datasets[1].data = Object.values(this.examStats).map((item: any) => item.completed)
    this.parsedStats.datasets[2].data = Object.values(this.examStats).map((item: any) => item.created - item.completed)
    this.parseTitle()
  }

  ngOnInit() {
    const date = new Date();
    const day = date.getDay()
    const diff = date.getDate() - day + (day == 0 ? -6 : 1);
    this.statsDate = new Date(date.setDate(diff));
    this.getStats()
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  timer?: number = undefined
  @ViewChild('chart') chart!: UIChart;

  chartChange($event: SelectButtonChangeEvent) {
    this.statsMode = $event.value
    this.getStats()
  }
  dateChange(dir: 'prev' | 'next') {
    switch (this.statsMode) {
      case "week":
        if (dir === 'prev') {
          this.statsDate.setDate(this.statsDate.getDate() - 7);
        } else {
          this.statsDate.setDate(this.statsDate.getDate() + 7);
        }
        break;
      case "month":
        if (dir === 'prev') {
          this.statsDate.setMonth(this.statsDate.getMonth() - 1);
        } else {
          this.statsDate.setMonth(this.statsDate.getMonth() + 1);
        }
        break;
      case "year":
        if (dir === 'prev') {
          this.statsDate.setFullYear(this.statsDate.getFullYear() - 1);
        } else {
          this.statsDate.setFullYear(this.statsDate.getFullYear() + 1);
        }
        break;
    }
    this.getStats()
  }
}
