const axios = require('axios').default;
const login = require('./login');
const fs = require('fs');
const https = require('https');
const gunzip = require('gunzip-file');
// const parse = require('csv-parse');
const csv = require('@fast-csv/parse');

let start = new Date().getTime();

async function getReport() { 
  start = new Date().getTime();
  let dimensions = [];

  let isFirst = true;
  fs.createReadStream('part.csv')
  .pipe(csv.parse({escape: '\\'}))
  .on('error', error => console.error(error))
  .on('data', line => {
    if(!isFirst) {
      const fields = line;
      const properties = fields[9];
      const json = properties;
      const props = JSON.parse(json);
      if(!dimensions[fields[1]]) {
        dimensions[fields[1]] = [];
      }
      for(const key of Object.keys(props)) {
        if(!dimensions[fields[1]][key]) {
          // dimensions[fields[1]][key] = new Set();
          dimensions[fields[1]][key] = new Map();
        }
        if(props[key] !== null) {
          // dimensions[fields[1]][key].add(props[key]);
          let incr = dimensions[fields[1]][key].get(props[key]);
          if(!incr) {
            incr = 0;
          }
          dimensions[fields[1]][key].set(props[key], incr + 1);
        }
      }
    } else {
      isFirst = false;
    }
  })
  .on('end', () => {
    let filtered = []
    for(const dimension of Object.keys(dimensions)) {
      console.log(dimension);
      filtered[dimension] = [];
      for(prop of Object.keys(dimensions[dimension])) {
        const map = dimensions[dimension][prop];

        if(map.size < 2 || map.size > 12) {
          dimensions[dimension][prop] = [];
        } else {
          let myMap = dimensions[dimension][prop];
          const sortedMap = new Map([...myMap.entries()].sort((a, b) => b[1] - a[1]));
          filtered[dimension][prop] = sortedMap;
        }
      }
    }
    console.log(filtered);
    console.log('FINISH RUN in ' + (new Date().getTime() - start)/1000 + ' seconds');            
  });
}

function findWorkspace(apiKey, workspaceName) {
  return axios.get('https://api.split.io/internal/api/v2/workspaces', { headers: { 'Authorization': 'Bearer ' + apiKey } })
  .then(function(response) {
    for (const workstation of response.data.objects) {
      if (workstation.name === workspaceName) {
        return workstation.id;
      }
    }
  })
  .catch(function(error) {
    console.log(error);
  });
}

async function downloadExport(csrf, authCookie, orgId, workspaceId, exportId) {
  // const exportId = 'afb2e81a-3387-4814-b9fd-1de963985e6d';
  // const exportId = '33f63f40-b685-495b-aab6-13826037d3ba';
  const environmentId = 'production';
  const url = 'https://app.split.io/internal/api/exports/' + exportId + '/organization/' + orgId + '/environment/' + environmentId;

  var config = {
    method: 'get',
    url: url,
    headers: { 
      'split-csrf': csrf, 
      'Cookie': authCookie
    }
  };

  let result; 
  await axios(config)
  .then(function (response) {
    result = response.data.downloadLink;
  })
  .catch(function (error) {
    console.log(error);
  });  

  return result;
}

getReport();
