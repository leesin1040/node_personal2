// function add(a, b) {
//   return a + b;
// }

const exp = require('constants');

const add = (a, b) => {
  return a + b;
};

exports.add = add;

//모듈을 호출 했을 때, add 키값에는 add 함수가 들어가는 방법
// module.exports = {add:add}

//모듈 그 자체를 바로 add 함수로 할당한다
// module.exports = add;

//모듈을 호출했을 때, add 키값에는 (a,b){retuen a+b;} 익명함수로 할당하는 방법
//exports.add = function (a,b){return a+b;}
