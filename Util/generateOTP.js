const otpGenerator = require('otp-generator');

function generateFixedLengthRandomNumber(numberOfDigits) {
  return otpGenerator.generate(numberOfDigits, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
}

module.exports = {generateFixedLengthRandomNumber};
