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
    this.getTeams()
      .then(teams => {
        const labels = teams.map(team => team.name)
        const project_counts = teams.map(team => team.project_ids.length)

        this.setState({
          chartData: {
            labels,
            datasets: [{
              label: 'Projects',
              data: project_counts,
              borderWidth: 1
            }]
          }
      })
    });
  }

  getTeams = async () => {
    const response = await fetch('/api/teams');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

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
