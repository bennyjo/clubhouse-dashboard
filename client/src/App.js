import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import { Bar } from 'react-chartjs-2';

class App extends Component {
  state = {
    teams: [],
    selectedTeamId: 'default',
    chartData: null
  };

  componentDidMount() {
    this.getTeams()
      .then(teams => {
        this.setState({teams})
        this.setState({selectedTeamId: teams[0].id})
      });
  }

  selectTeam(event) {
    if (!event) {
      return
    }

    this.setState({selectedTeamId: parseInt(event.target.value, 10)});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedTeamId === this.state.selectedTeamId) {
      return;
    }

    this.getProjects(this.state.selectedTeamId)
      .then(projects => console.log(projects))

    // Get projects for selected team
    // Get stories for projects
    // Sort stories into sprints
    // Calculate average cycle time for stories in intervals

    // Get the projects for the selectedTeamId
    // const labels = teams.map(team => team.name)
    // const project_counts = teams.map(team => team.project_ids.length)

    // this.setState({
    //   chartData: {
    //     labels,
    //     datasets: [{
    //       label: 'Projects',
    //       data: project_counts,
    //       borderWidth: 1
    //     }]
    //   }
    // })

    const sprints = {
      'q3s3': [new Date('August 8, 2018'), new Date('August 21, 2018')],
      'q3s4': [new Date('August 22, 2018'), new Date('September 4, 2018')],
      'q3s5': [new Date('September 5, 2018'), new Date('September 18, 2018')],
      'q3s6': [new Date('September 19, 2018'), new Date('October 2, 2018')]
    }

    const sprintNames = Object.keys(sprints);

    // Find all stories in each interval
    sprintNames.forEach(sprintName => {});

    // Calculate cycle time: story.start_time - story.end_time, round up to full days

    console.log(`new team selected ${this.state.selectedTeamId}`)
  }

  getTeams = async () => {
    const response = await fetch('/api/teams');
    const teams = await response.json();

    if (response.status !== 200) throw Error(teams.message);

    return teams;
  };

  getProjects = async (teamId) => {
    const response = await fetch('/api/projects');
    const projects = await response.json();

    if (response.status !== 200) throw Error(projects.message);

    if (teamId) {
      return projects.filter(team => team.team_id === teamId);
    }

    return projects;
  };

  getStories = async (team) => {
    const response = await fetch('/api/stories');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
      <div className="App">
        <select value={this.state.selectedTeamId} onChange={this.selectTeam.bind(this)}>
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
