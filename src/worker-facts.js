import {ValidationError} from './api-errors.js';
export function validateWorkerFacts(options,provinces) {
  if(!options||typeof options!=='object'||Array.isArray(options))throw new ValidationError('Worker facts are required');

  if(typeof options.province!=='string'||!Object.hasOwn(provinces,options.province.toUpperCase().trim()))throw new ValidationError('Choose a supported province');
  for(const key of ['hourlyRateCad','averageWeeklyHoursWorked','weeksWorkedTotal','publicHolidaysWorkedCount'])if(typeof options[key]!=='number'||!Number.isFinite(options[key])||options[key]<0)throw new ValidationError(key+' must be supplied as a finite nonnegative number');
  for(const key of ['employerSetsScheduleAndLocation','employerProvidesToolsAndLaptop','workerCannotHireSubcontractors','workerHasNoRiskOfFinancialLoss','workerWorksExclusivelyForEmployer','wasVacationPayPaid','wasOvertimePayPaid'])if(typeof options[key]!=='boolean')throw new ValidationError(key+' must be supplied as a boolean');
  if(options.averageWeeklyHoursWorked>168||options.weeksWorkedTotal>500||options.hourlyRateCad>5000||options.publicHolidaysWorkedCount>50||!Number.isInteger(options.publicHolidaysWorkedCount))throw new ValidationError('Invalid hours, weeks or holiday count');
  if(options.contractLabelsWorkerAs!==undefined&&!['independent_contractor','sole_proprietorship','employee'].includes(options.contractLabelsWorkerAs))throw new ValidationError('Unsupported contract label');
  return options;
}
