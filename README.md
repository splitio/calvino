# Calvino

Tool for assisting Dimensional Analysis users.

Create a report of available dimensions from a CSV export.

Could readily be moved to an AWS lambda.

## Usage

Data hub -> Data export -> Create Events data

For high volume environments, use last 24 hours.
For other environments, export last 7 days.

Download the GZIP of your events.
Unzip the events.

Copy the CSV to *part.csv*

The tool expects its input to be called *part.csv*

To run the tool... 

```
> npm install
```

```
> node index.js
```

Report is generated...

Event type id, followed by properties found with sets of 2-5 values.
Number of occurrences follows each property value.

```
  open_board: [
    property_team_sharing_state: Map(4) {
      'edit' => 606166,
      'off' => 197526,
      'view' => 42092,
      'comment' => 23834
    },   
```

## Questions

david.martin@split.io
