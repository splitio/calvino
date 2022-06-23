# Calvino

Tool for assisting Dimensional Analysis users.

Create a report of available dimensions from a named export (by exportId).
A future version may create the export itself.

Could readily be moved to an AWS lambda.

## Usage

```
> npm install
```

create input.json as shown below

```
> node index.js
```

Report is generated...

```
  readClick: [
    region: Set(3) { 'EU', 'JP', 'US' },
    status: Set(3) { 'platinum', 'silver', 'gold' },
    author: Set(3) { 'Nabokov', 'Boynton', 'Carle' }
  ],
```

Event type id, followed by properties found with sets of 2-5 values.

## Input expected

Create an input.json like the one shown below

```json
{
    'email' : 'david.martin@split.io',
    'password': 'Test_1234',
    'splitAdminApiKey': '<your split admin api key>',
    'workspaceName': 'Prod-Default',
    'exportId': '33f63f40-b685-495b-aab6-13826037d3bb'
}
```

## Q
