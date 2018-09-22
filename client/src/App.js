import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import { generateSprints } from './generateSprints';

import { Scatter } from 'react-chartjs-2';

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
        this.getStories(projectIds, {started: true, completed: true})
          .then(stories => {
            function dayCount(started_date, completed_date) {
              const oneDay = 24 * 60 * 60 * 1000;
              const diffDays = Math.round(Math.abs((new Date(started_date).getTime() - new Date(completed_date).getTime())/(oneDay)));

              return diffDays;
            }

            const scatterPoints = stories
              .filter(story => story.started_at !== story.completed_at)
              .map(story => ({
                  t: new Date(story.completed_at),
                  y: dayCount(story.started_at, story.completed_at) + 1,
                  x: story.name
                })
              );

            const sprints = generateSprints();
            const sprintNames = Object.keys(sprints);

            const sprintBuckedtedPoints = scatterPoints.reduce((sprints, currentPoint) => {
              sprintNames.some(sprintName => {
                const sprint = sprints[sprintName];

                if (currentPoint.t > sprint.duration[0] && currentPoint.t <= sprint.duration[1]) {
                  sprint.cycleTimeSum = sprint.cycleTimeSum + currentPoint.y;
                  sprint.cycleTimeCount = sprint.cycleTimeCount + 1;

                  return true;
                }
              });

              return sprints;
            }, sprints);

            const linePoints = sprintNames.map(sprintName => {
              const sprintBucket = sprintBuckedtedPoints[sprintName];

              return {
                t: sprintBucket.duration[1],
                y: sprintBucket.cycleTimeCount ? (sprintBucket.cycleTimeSum/sprintBucket.cycleTimeCount).toFixed(2) : 0,
                x: sprintName
              };
            });

            console.log(linePoints);

            this.setState({
              chartData: {
                datasets: [{
                  label: 'Story cycle time',
                  data: scatterPoints,
                  borderWidth: 1
                }, {
                  label: 'Line Dataset',
                  data: linePoints,

                  // Changes this dataset to become a line
                  type: 'line',
                  borderColor: 'blue',
                  borderWidth: 1,
                  showLine: true,
                  fill: false
                }]
              }
            })

            // Calculate average cycle time for stories in intervals
          })
      })
    

    // Get the projects for the selectedTeamId
    // const labels = teams.map(team => team.name)
    // const project_counts = teams.map(team => team.project_ids.length)

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
              <Scatter data={this.state.chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  tooltips: {
                    callbacks: {
                      label: function(tooltipItem, data) {
                          const dataset = data.datasets[tooltipItem.datasetIndex];
                          const dataItem = dataset.data[tooltipItem.index];

                          return `${dataItem.x}: ${dataItem.y} `;
                      }
                    }
                  },
                  scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                          isoWeekday: true,
                          tooltipFormat: 'MMM D h:mm a'
                        }
                    }]
                  },
                  
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
