// formulas taken with attribution from http://www.gribble.org/cycling/power_v_speed.html

// calculate velocity using binary search algorithm
var velocity = {};
module.exports = velocity;

velocity.biking = function(grade) {
  // How close to get before finishing.
  var epsilon = 0.000001;

  // Set some reasonable upper / lower starting points.
  var lowervel = -1000.0;
  var uppervel = 1000.0;
  var midvel = 0.0;
  params.grade = grade*100;
  
  var midpow = CalculatePower(midvel, params);

  // Iterate until completion.
  var itcount = 0;
  do {
    if (Math.abs(midpow - params.power) < epsilon)
      break;
    if (midpow > params.power)
      uppervel = midvel;
    else
      lowervel = midvel;

    midvel = (uppervel + lowervel) / 2.0;
    midpow = CalculatePower(midvel, params);
  } while (itcount++ < 100);

  return midvel;
}


function CalculatePower(velocity, params) {
  // calculate the forces on the rider.
  var forces = CalculateForces(velocity, params);
  var totalforce = forces.Fgravity + forces.Frolling + forces.Fdrag;

  // calculate necessary wheelpower
  var wheelpower = totalforce * (velocity * 1000.0 / 3600.0);

  // calculate necessary legpower
  var legpower = wheelpower / (1.0 - (params.rp_dtl / 100.0));

  return legpower;
}

function CalculateForces(velocity, params) {
  // calculate Fgravity
  var Fgravity = 9.8067 *
    (params.rp_wr + params.rp_wb) *
    Math.sin(Math.atan(params.grade / 100.0));

  // calculate Frolling
  var Frolling = 9.8067 *
    (params.rp_wr + params.rp_wb) *
    Math.cos(Math.atan(params.grade / 100.0)) *
    (params.ep_crr);

  // calculate Fdrag
  var Fdrag = 0.5 *
    (params.rp_a) *
    (params.rp_cd) *
    (params.ep_rho) *
    (velocity * 1000.0 / 3600.0) *
    (velocity * 1000.0 / 3600.0);

  // cons up and return the force components
  var ret = {};
  ret.Fgravity = Fgravity;
  ret.Frolling = Frolling;
  ret.Fdrag = Fdrag;
  return ret;
}

var params = {
  units: "metric",
  rp_wr: 75, // weight of rider (kg)
  rp_wb: 8, // weight of bike (kg)
  rp_a: 0.509, // frontal area, rider+bike (m^2)
  rp_cd: 0.63, // drag coefficient Cd
  rp_dtl: 3, // drivetrain loss Loss_dt
  ep_crr: 0.005, // coefficient of rolling resistance Crr
  ep_rho: 1.226, // air density (kg / m^3)
  p2v: 200, // 200 watts of power for the P2V field
  v2p: 35, // 35kph for the V2P field
  grade: 0, // grade of hill (%)
  power: 60 // generalized power of 60 watts for leisurely riding
};


