import {
  renderWorkoutBuilder,
  setBuilderSelectedStudentId,
  setBuilderSelectedDay
} from '../personalPortal/workoutBuilder.js';

export function setAdminWorkoutStudent(id) {
  setBuilderSelectedStudentId(id);
}

export function setAdminWorkoutDay(day) {
  setBuilderSelectedDay(day);
}

export function renderAdminWorkoutManager() {
  return renderWorkoutBuilder();
}
