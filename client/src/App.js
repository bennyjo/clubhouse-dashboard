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

    // Get projects for selected team
    this.getProjects(this.state.selectedTeamId)
      .then(projects => {
        const projectIds = projects.map(project => project.id);

        // Get stories for projects
        this.getStories(projectIds, {started: true})
          .then(stories => {
            console.log(stories.map(story => story.started_at))
            console.log(stories)

            // Sort stories into sprints
            const sprints = {
              'q3s3': [new Date('August 8, 2018'), new Date('August 21, 2018')],
              'q3s4': [new Date('August 22, 2018'), new Date('September 4, 2018')],
              'q3s5': [new Date('September 5, 2018'), new Date('September 18, 2018')],
              'q3s6': [new Date('September 19, 2018'), new Date('October 2, 2018')]
            }

            const sprintNames = Object.keys(sprints);

            sprintNames.map(sprintNames => {
              
            });

            // Calculate average cycle time for stories in intervals

          })
      })
    

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

  getStories = async (projectIds, filters) => {
    if (!Array.isArray(projectIds) || !projectIds.length) {
      throw Error('No project ids given. Need at least one project id to list stories for.')
    }

    const firstProjectId = projectIds.shift();
    let uri = `/api/projects/stories?projectId=${firstProjectId}`;

    projectIds.forEach(projectId => {
      uri = uri + `&projectId=${projectId}`;
    });

    Object.keys(filters).forEach(filterName => {
      const filterValue = filters[filterName];
      uri = uri + `&${filterName}=${filterValue}`;
    });

    const response = await fetch(uri);
    const stories = await response.json();

    if (response.status !== 200) throw Error(stories.message);

    return stories;
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
