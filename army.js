/**
 * Read data from command line
 * order of data: 1. No of tents, 2. No of soldiers per tent, 3. No of drivers per tent, 4. Duration in hours
 */
data = []
process.argv.forEach(function (val, index, array) {
    data.push(val)
    console.log(data[2]);
});

/**
 * @param data is from above 
 * creates array of tents asked by user
 * @example [[soldiers in tent1], [soldiers in tent2]]
 */

const createTents = (data) => {
    let tentArray = [];

    let nrOfTents = data[2];
    let nrOfSoldiers = data[3];
    let nrOfDrivers = data[4];

    for (var i=0; i<nrOfTents; i++){
        tentArray.push([]);
        for (var a=0; a<nrOfSoldiers; a++){

            //if there are more drivers needed
            if (a < nrOfDrivers){
                tentArray[i].push({name: 'Soldier'+a, driver: 1, hours: 0, lastShift: 0});
            }
            else {
                tentArray[i].push({name: 'Soldier'+a, driver: 0, hours: 0, lastShift: 0});
            }           
        }
    }
    return tentArray;
};

/**
 * creates an empty schedule
 * is grouped by tents and on every hour there will be empty slots for stovewatch and patrolling
 */

const createEmptySchedule = (hours, nrOfTents) => {

    schedule = [];
    for (var i=0; i<nrOfTents; i++){

        schedule.push({tent:i, hours: []});
        for (var a=0; a<hours; a++){
            schedule[i].hours.push({hour:a, soldiers:{
                stove: '',
                patrol1: '',
                patrol2: ''
            }});
        }
    };
    return schedule;
};

/**
 * Finds shift length. Should be useful to make sleep times longer
 */

const findShiftLength = (span, soldiers, nrOfTents) => {
    let totalHours = span.hours*(1+1/nrOfTents);
    let shiftLength = Math.ceil(totalHours/soldiers.length);
    return shiftLength;
};

/**
 * Finds hours when different tents will be on patrol
 * returns Array of all the patrol times.
 */

const findPatrolHours = (hours, nrOfTents, nr) => {

    let hoursPerTent = Math.ceil(hours/nrOfTents);
    let hoursArray = [];

    for(var i = 0; i<nrOfTents; i++){

        if (i==0){
            hoursArray.push([0,hoursPerTent-1])
        }
        else {
            let startHour = hoursArray[i-1][1]+1;
            let endHour = startHour-1+hoursPerTent;

            if (endHour > hours-1) {
                hoursArray.push([startHour, hours-1]);
            }
            else {
                hoursArray.push([startHour, endHour]);
            }
        }
    }
    return hoursArray;
};

const findBestAvailableSoldiers = (soldiers, time, drivers) => {
    let available = [];

    for (var i=0;i<soldiers.length;i++){

        if (drivers){
            available = withDrivers(i, soldiers, available);
        }
        else {
            available = withoutDrivers(i, soldiers, available);
        }        
    }

    let sorted = available.sort(function (a, b) {
        return a.hours - b.hours;
    });

    var sortedTop2 = sorted.slice(0, 2);
    return sortedTop2;

};

const withDrivers = (i, soldiers, available) => {
    if (soldiers[i].driver == 1) {
        if (soldiers[i].driver.lastSlept >= 6) {
            available.push(soldiers[i]);
        } 
    }
    else {
        available.push(soldiers[i]);
    };
};

const withoutDrivers = (i, soldiers, available) => {
    if (soldiers[i].driver != 1) {
        available.push(soldiers[i]);
    };
};