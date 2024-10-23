function getAverage(scores) {
    let sum = 0;
  
    for (const score of scores) {
      sum += score;
    }
  
    return sum / scores.length;
  }
  
  function getGrade(score) {
    if (score === 100) {
      return "A++";
    } else if (score >= 90) {
      return "A";
    } else if (score >= 80) {
      return "B";
    } else if (score >= 70) {
      return "C";
    } else if (score >= 60) {
      return "D";
    } else {
      return "F";
    }
  }
  
  function hasPassingGrade(score) {
    return getGrade(score) !== "F";
  }
  
  function studentMsg(totalScores, studentScore) {
  var grade = hasPassingGrade(studentScore);
  let average = getAverage(totalScores);
  var message;
  if(grade == true){
    return message = `Class average: ${average}. Your grade: ${getGrade(studentScore)}. You passed the course.`
  } else {
    return message = `Class average: ${average}. Your grade: ${getGrade(studentScore)}. You failed the course.`
  }
  }