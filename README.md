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

The tool expects its input to be the name of your CSV file

To run the tool... you must have node.js installed and I assume you can use the terminal. 

```
> npm install
```

The CSV is expected to be uncompressed.

```
> node index.js <filename of your CSV events>
```

That will put the report to standard out.  If you want to save it?

```
node index.js <filename of your CSV events> | tee report
```
This puts the report to standard out and a file called report.

Report is generated...

Event type id, followed by properties found with sets between 2 and 12 unique values.
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
