import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import { Bar } from 'react-chartjs-2';

class App extends Component {
  state = {
    response: '',
    chartData: null
  };

  componentDidMount() {
    this.setState({
      chartData: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      }
    });

    this.callApi()
      .then(res => {})
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/projects');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
      <div className="App">
        { this.state.chartData ?
          <div className="chart-container">
              <Bar data={this.state.chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }
              }/> 
          </div>
          :
          <p>Loading...</p>
        }
      </div>
    );
  }
}

export default App;
