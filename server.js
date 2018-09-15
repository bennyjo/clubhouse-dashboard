require('dotenv').config()

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

const Clubhouse = require('clubhouse-lib');
const clubhouse = Clubhouse.create(process.env.CLUBHOUSE_API_KEY);

// API calls
app.get('/api/projects', (req, res) => {
  clubhouse.listProjects()
    .then(resp => res.send(resp))
    .catch(err => console.log(err));
});

app.get('/api/teams', (req, res) => {
  clubhouse.listTeams()
    .then(resp => res.send(resp))
    .catch(err => console.log(err));
});

app.get('/api/projects/stories', (req, res) => {
  const projectIdQuery = req.query.projectId;
  const projectIds = Array.isArray(projectIdQuery)
    ? projectIdQuery
    : [projectIdQuery];
  
  if (projectIds && projectIds.length) {
    Promise.all(projectIds.map(projectId => clubhouse.listStories(projectId)))
      .then(responses => {
        res.send([].concat(...responses))
      })
      .catch(err => console.log(err));
  } else {
    res
      .status('400')
      .send({ 'error': 'Need a list of project ids to list stories for those projects.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));