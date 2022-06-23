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
  let event = JSON.parse(fs.readFileSync('input.json')); 
  console.log(event);

  const cookies = await login.login(event);

  csrf = cookies.csrf;
  jwt = cookies.jwt;

  if(!csrf || !jwt) {
    const loginError = {
      statusCode: 500,
      body: { 'result': 'couldn\'t login! password correct? account locked?' }
    };

    console.log(loginError);
    return loginError;
  }

  authCookie = 'split-csrf=' + csrf + "; split-jwt=" + jwt + ';';
  const orgPair = await login.getOrgId(csrf, authCookie);
  orgId = orgPair.orgId;
  splitUserIdentifier = orgPair.splitUserIdentifier;

  workspaceId = await findWorkspace(event.splitAdminApiKey, event.workspaceName);

  let s = new Date().getTime();
  let link = await downloadExport(csrf, authCookie, orgId, workspaceId, event.exportId);
  console.log(link);

  let dimensions = [];
  https.get(link, (res) => {
    const path = 'part.gz';
    const filePath = fs.createWriteStream(path);
    res.pipe(filePath);
    filePath.on('finish', () => {
      filePath.close();
      console.log('download completed');

      const options = {
        delimiter: ',',
        quote: '"',
        relax: true
      };

      gunzip('part.gz', 'part.csv', function() {
         console.log('gunzipped data');
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
                  dimensions[fields[1]][key] = new Set();
                }
                dimensions[fields[1]][key].add(props[key]);
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
                const set = dimensions[dimension][prop];
                if(set.size < 2 || set.size > 5) {
                  dimensions[dimension][prop] = [];
                } else {
                  filtered[dimension][prop] = dimensions[dimension][prop];
                }
              }
            }
            console.log(dimensions);
            console.log(filtered);
          });
      });
    });
  });
  console.log('FINISH RUN in ' + (new Date().getTime() - start)/1000 + ' seconds');
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
