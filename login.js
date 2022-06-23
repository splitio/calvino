const axios = require('axios').default;

module.exports = {
    
  login:
        async function login(event) {
          // console.log('logging in...');
          // console.log(event);
          const body = {
            email: event.email,
            password: event.password
          };
          // console.log(body);
          let csrf;
          let jwt;
          await axios.post('https://app.split.io/login', body, { withCredentials: true })
            .then(function(response) {
              console.log('logged in: ' + response.status);
              // console.log(response.headers['set-cookie']);
              csrf = response.headers['set-cookie'][0];
              csrf = csrf.substring(csrf.indexOf('=', 0) + 1, csrf.indexOf(';', 0));
              jwt = response.headers['set-cookie'][1];
              jwt = jwt.substring(jwt.indexOf('=', 0) + 1, jwt.indexOf(';', 0));
            })
            .catch(function(error) {
              console.log(error);
            });
         return { 'csrf': csrf, 'jwt': jwt };
        },
    getOrgId:
        async function getOrgId(csrf, authCookie) {
          // console.log('getting orgId');
          // console.log('authCookie: ' + authCookie);
          let orgId, splitUserIdentifier;
          await axios.get('https://app.split.io/internal/api/organizationMemberships', {
            headers: {
              'split-csrf': csrf,
              Cookie: authCookie
              }
            })
            .then(function(response) {
              // console.log('got organizationMemberships and splitUserIdentifier');
              // console.log(response);
              orgId = response.data[0].orgId;
              splitUserIdentifier = response.data[0].userId;
              // console.log('found orgId: ' + orgId);
            })
            .catch(function(error) {
              console.log(error);
            });

        return { 'orgId': orgId, 'splitUserIdentifier': splitUserIdentifier };
     }
                          
};