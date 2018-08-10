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