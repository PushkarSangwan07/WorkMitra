const PROFESSION_KEYWORDS = {
  carpenter: [
    "carpenter",
    "wood",
    "wooden",
    "door",
    "window",
    "table",
    "chair",
    "bed",
    "cupboard",
    "furniture",
    "plywood",
    "cabinet"
  ],

  electrician: [
    "electrician",
    "electric",
    "switch",
    "socket",
    "light",
    "fan",
    "wire",
    "wiring",
    "bulb",
    "mcb"
  ],

  plumber: [
    "plumber",
    "pipe",
    "tap",
    "toilet",
    "washroom",
    "bathroom",
    "leak",
    "water",
    "drain",
    "sink"
  ],

  painter: [
    "paint",
    "painting",
    "wall",
    "color",
    "room",
    "house paint"
  ],

  "ac technician": [
    "ac",
    "air conditioner",
    "cooling",
    "compressor",
    "gas refill",
    "split ac",
    "window ac"
  ]
};

function detectProfession(job) {
  const text = job.toLowerCase();

  let bestProfession = null;
  let bestScore = 0;

  for (const profession in PROFESSION_KEYWORDS) {
    let score = 0;

    PROFESSION_KEYWORDS[profession].forEach((word) => {
      if (text.includes(word)) {
        score++;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestProfession = profession;
    }
  }

  return bestProfession;
}

function calculateScore(worker, job, minBudget, maxBudget) {

  let score = 0;
  let reasons = [];

  const detectedProfession = detectProfession(job);

  if (
    detectedProfession &&
    worker.profession.toLowerCase().includes(detectedProfession)
  ) {
    score += 100;
    reasons.push("Profession Match");
  }

  const jobText = job.toLowerCase();

  worker.skills.forEach(skill => {

    if(jobText.includes(skill.toLowerCase())){
      score += 15;
    }

  });

  if(
      worker.rateAmount>=minBudget &&
      worker.rateAmount<=maxBudget
  ){
      score+=20;
      reasons.push("Budget Match");
  }

  if(worker.verification.status==="verified"){
      score+=20;
      reasons.push("Verified");
  }

  score += worker.ratingAvg*10;

  if(worker.ratingAvg>=4.5){
      reasons.push("Highly Rated");
  }

  score += Math.min(worker.experienceYears,15);

  score += Math.min(worker.jobsCompleted/5,20);

  return {

      score,

      reason: reasons.join(", "),

      detectedProfession

  };

}

module.exports = calculateScore;