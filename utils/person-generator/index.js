var fs = require('fs');
var ssn = require('ssn');
var moment = require('moment');
var sprintf = require('sprintf').sprintf;
var dlgen = require('dlgen');

var female = fs.readFileSync(__dirname + '/dist.female.first.txt', {encoding: 'utf8'}).split("\n");
var male = fs.readFileSync(__dirname + '/dist.male.first.txt', {encoding: 'utf8'}).split("\n");
var last_name = fs.readFileSync(__dirname + '/dist.all.last.txt', {encoding: 'utf8'}).split("\n");

exports.get = function(r) {
    var gender = [female, male];
    
    var selected_gender_index = Math.floor(Math.random() * gender.length );
    var selected_gender = gender[selected_gender_index];
    var first_name_index = Math.floor(Math.random() * (selected_gender.length - 1));
    var selected_first_name = selected_gender[first_name_index];

    var selected_middle_name;
    if ( Math.floor(Math.random() * 2 ) ) {
        var middle_name_index = Math.floor(Math.random() * (selected_gender.length - 1));
        selected_middle_name = selected_gender[middle_name_index];
    } else {
        selected_middle_name = "";
    }
    
    var last_name_index = Math.floor(Math.random() * (last_name.length - 1));
    var selected_last_name = last_name[last_name_index];
    
    // start date can be 2 years ago to 2 years in the future
    var start_date = new Date(Date.now() - 60 * 60 * 24 * 365 * 2);
    var end_date = new Date(Date.now() + 60 * 60 * 24 * 365 * 2);
    var apt_start_date = randomDate(start_date, end_date); 
    var apt_duration = Math.floor(Math.random() * 300);

    var apt_end_date =  new Date(apt_start_date.getTime() + apt_duration * 1000 * 60);

    var person = {
        pid: {
            set: 1,
            external: randAlphaNum(20),
            internal: randAlpha(20),
            alternate: randNum(20)
        },
        ssn: ssn.generate().replace(/-/g,''),
        dob: formatDate(randomDate()),
        lastName: selected_last_name,
        firstName: selected_first_name,
        middleName: selected_middle_name,
        middleInitial: selected_middle_name.charAt(0),
        phoneNumber: {
            home: phoneNumber(),
            business: phoneNumber()
        },
        gender: selected_gender_index === 0 ? "female" : "male",
        appointment: {
            start: formatDate(apt_start_date),
            end: formatDate(apt_end_date),
            duration: apt_duration,
            durationUnits: "MIN"
        },
        dmv: {
            id: undefined
        }
    };

    person.dmv.id = dlgen.bake(person, true);
    return person;
}

function randomDate(start, end) {
    var start = start || new Date(1920,0,1);
    var end = end || new Date();
    var data = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return data;
}

function formatDate(date) {
    var formatted_data = sprintf('%4d-%02d-%02d %02d:%02d:%02d', date.getFullYear(), (date.getMonth() + 1), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
    return formatted_data;
}

function phoneNumber(){
    var phoneNumber = {
        areaCode: (100 + Math.floor(Math.random() * (999 - 100))),
        firstThree: (100 + Math.floor(Math.random() * (999 - 100))),
        lastFour: (1000 + Math.floor(Math.random() * (9999 - 1000)))
    };
    return '(' + phoneNumber.areaCode + ')' + phoneNumber.firstThree + '-' + phoneNumber.lastFour;
};

function randAlphaNum(size) {
    var size = size || 10;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for( var i=0; i<size; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function randAlpha(size) {
    var size = size || 10;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for( var i=0; i<size; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function randNum(size) {
    var size = size || 10;
    var text = "";
    var possible = "0123456789";
    for( var i=0; i<size; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}


