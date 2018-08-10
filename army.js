/**
 * Read data from command line
 * order of data: 1. No of tents, 2. No of soldiers per tent, 3. No of drivers per tent, 4. number of sick people, 5.Duration in hours
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
    let nrOfIll = data[5];

    for (var i=0; i<nrOfTents; i++){
        tentArray.push([]);
        for (var a=0; a<nrOfSoldiers; a++){

            //if there are more drivers needed
            if (a < nrOfDrivers){
                tentArray[i].push({name: 'Soldier'+a+'_'+i, driver: 1, hours: 0, lastShift: 0, ill: 0});
            }
            if (a > nrOfDrivers && a < nrOfIll+nrOfDrivers) {
                tentArray[i].push({name: 'Soldier'+a+'_'+i, driver: 0, hours: 0, lastShift: 0, ill: 1});
            }
            else {
                tentArray[i].push({name: 'Soldier'+a+'_'+i, driver: 0, hours: 0, lastShift: 0, ill: 0});
            }           
        }
    }
    console.log(tentArray);
    return tentArray;
};

//generating testdata
const tents = createTents(data);
const testSpan = {hours: data[6]};

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

/**
 * finds soldiers who have had to guard the least
 * if the hours are fitting for the drivers, withDrivers() helper function finds
 * if the driver has gotten enough sleep and adds to the array
 * in the end top 2 of the array sorted by hours is returned
 */

const findBestAvailableSoldiers = (soldiers, time, drivers, ill) => {
    let available2 = [];
    let available = [];

    for (var i=0;i<soldiers.length;i++){
        
        if (drivers){
            available = withoutDrivers(i, soldiers, available2);
        }
        else {
            available = withoutDrivers(i, soldiers, available2);
        }
        if (ill) {
            available = withoutIll(i, soldiers, available2);
        }
        
              
    }

    let sorted = available.sort(function (a, b) {
        return a.hours - b.hours;
    });

    var sortedTop3 = sorted.slice(0, 3);
    return sortedTop3;

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
    return available;
};

const withoutDrivers = (i, soldiers, available) => {
    if (soldiers[i].driver != 1) {
        available.push(soldiers[i]);
    };
    return available;
};

const withoutIll = (i, soldiers, available) => {
    if (soldiers[i].ill != 1) {
        available.push(soldiers[i]);
    };
    return available;
};

const assignHours = (patrolHours, hours, tent, schedule, nr) => {
    let start = 0;
    let stop = hours;
    let stoveTrue = true;
    
    if (patrolHours != null) {
        start = patrolHours[0];
        stop = patrolHours[1]+1;
        stoveTrue = false;
        
    }

    for (var i=start; i<stop; i++){
        let condition = (hours-i > 6 || i >= 6);
        let soldiers = findBestAvailableSoldiers(tent, i, condition);

        if (stoveTrue) {//todo check et keegi ees poleks seal juba
            let soldier1inPatrol = schedule[nr].hours[i].soldiers.patrol1.name;
            let soldier2inPatrol = schedule[nr].hours[i].soldiers.patrol2.name;

            // helpers to eliminate duplicate soldiers on stove and patrol
            let option1 = soldiers[0].name;
            let option2 = soldiers[1].name;
            let option3 = soldiers[2].name;

            if (option1 == soldier1inPatrol || option1 == soldier2inPatrol){
                if (option2 == soldier1inPatrol || option2 == soldier2inPatrol) {
                    tent[tent.indexOf(soldiers[2])].hours++;
                    schedule[nr].hours[i].soldiers.stove = soldiers[2];
                }
                else {
                    tent[tent.indexOf(soldiers[1])].hours++;
                    schedule[nr].hours[i].soldiers.stove = soldiers[1];
                }
            }
            else {
                tent[tent.indexOf(soldiers[0])].hours++;
                schedule[nr].hours[i].soldiers.stove = soldiers[0];
            }
            
        }
        else {

            if (soldiers[0])

            tent[tent.indexOf(soldiers[0])].hours++;
            tent[tent.indexOf(soldiers[1])].hours++;
    
            schedule[nr].hours[i].soldiers.patrol1 = soldiers[0];
            schedule[nr].hours[i].soldiers.patrol2 = soldiers[1];
        };
    };
};

/**
 * assigns schedule for one tent
 */

const singleTentScheduleMaker = (span, tent, nrOfTents, nr, schedule) => {

    let totalHours = span.hours;
    let shiftLength = findShiftLength(span, tent, nrOfTents);
    let patrolHours = findPatrolHours(span.hours, nrOfTents, nr);


    assignHours(patrolHours[nr], span.hours, tent, schedule, nr);
    assignHours(null, span.hours, tent, schedule, nr);

};

/**
 * iterates tent array and creates full schedule
 */

const totalScheduleMaker = (tents, span) => {
    schedule = createEmptySchedule(span.hours, tents.length);
    for (var i=0;i<tents.length;i++){
        singleTentScheduleMaker(span, tents[i], tents.length, i, schedule);
    };
    prettyConsoleUI(schedule);
};

const prettyConsoleUI = (schedule) => {
    for(var i = 0; i<schedule.length; i++) {
        console.log('----------------');
        console.log('Tent no. '+(schedule[i].tent+1));
        for (var a=0; a<schedule[i].hours.length; a++){
            console.log('Hours '+schedule[i].hours[a].hour+' - '+(schedule[i].hours[a].hour+1));
            let stove = 'Stove: ' + schedule[i].hours[a].soldiers.stove.name// + ' - ' + schedule[i].hours[a].soldiers.stove.hours
            patrol1 = ''
            let patrol2 = ''

            if (schedule[i].hours[a].soldiers.patrol1.name) {
                patrol1 = 'First patrol: ' + schedule[i].hours[a].soldiers.patrol1.name// + ' - ' + schedule[i].hours[a].soldiers.patrol1.hours
            }

            if (schedule[i].hours[a].soldiers.patrol2.name) {
                patrol2 = 'Second patrol: ' + schedule[i].hours[a].soldiers.patrol2.name// + ' - ' + schedule[i].hours[a].soldiers.patrol2.hours
                console.log(stove + ' - ' + patrol1 + ' - ' + patrol2);
            }
            else {
                console.log(stove);
            }
            console.log('\n');
            
            
        }
    };
};

totalScheduleMaker(tents, testSpan);