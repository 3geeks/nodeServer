# person-generator

Generate a fake person with "real" data

## Description

When creating analytics software, having data is crucial, 
this generator is different from others, because it is 
utilizing real information, without using online APIs to 
create a person that can pass various validations in your
code.

This module is using census information from census.gov
from 1990

[census names](http://www.census.gov/topics/population/genealogy/data/1990_census/1990_census_namefiles.html)

that contains 88799 last names, 4275 female names, and 1219 male names.

Module implements generation of: 
* First, Last, and Middle name
* Date of birth
* Gender
* Phone numbers
* Appointment data
* Three unique identifiers
* Social security (not random set of numbers)
* Drivers license ID (utilizing real data)


## Installation

```
npm install person-generator
```

## Synopsis
```
var Person = require('person-generator');

console.log(Person.get());

/*
{ pid: 
   { set: 1,
     external: '0VBD0NMFI20W5UCGXF6H',
     internal: 'KJDZBFMNIOLDTBXDHYZP',
     alternate: '01522798582610954454' },
  ssn: '262153012',
  dob: '1951-01-30 12:05:16',
  lastName: 'MCKERLIE',
  firstName: 'COLBY',
  middleName: 'AMOS',
  middleInitial: 'A',
  phoneNumber: { home: '(197)427-9527', business: '(326)501-2942' },
  gender: 'male',
  appointment: 
   { start: '2016-05-20 23:10:57',
     end: '2016-05-21 02:23:57',
     duration: 193,
     durationUnits: 'MIN' },
  dmv: { id: 'M264-101-51-030-0' } }
*/
```

