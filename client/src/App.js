import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import { Bar } from 'react-chartjs-2';

class App extends Component {
  state = {
    response: '',
    teams: [],
    selectedTeam: 'default',
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

        this.setState({teams})
    });
  }

  selectTeam(event) {
    if (!event) {
      return
    }

    this.setState({selectedTeam: event.target.selectedTeam});
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
        <select value={this.state.selectedTeam} onChange={this.selectTeam.bind(this)}>
          <option value="default">Select a team</option>
          {
            this.state.teams.map(team => {
              return <option value={team.id} key={team.id}>{team.name}</option>
            })
          }
        </select>

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
