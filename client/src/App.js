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
    this.getProjects()
      .then(projects => {
        const labels = projects.map(project => project.name)

        this.setState({
          chartData: {
            labels,
            datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              borderWidth: 1
            }]
          }
      })
    });

    this.getProjects()
      .then(res => {})
      .catch(err => console.log(err));
  }

  getProjects = async () => {
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
