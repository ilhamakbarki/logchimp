const getRandomUppercaseLetter = (length = 6) => {
  const asciiStart = 65; // 'A'
  const asciiEnd = 90;   // 'Z'
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomAscii = Math.floor(Math.random() * (asciiEnd - asciiStart + 1)) + asciiStart;
    result += String.fromCharCode(randomAscii);
  }

  return result;
}

const getRandomLowercaseLetter = (length = 6) => {
  const asciiStart = 97; // 'a'
  const asciiEnd = 122;  // 'z'
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomAscii = Math.floor(Math.random() * (asciiEnd - asciiStart + 1)) + asciiStart;
    result += String.fromCharCode(randomAscii);
  }

  return result;
}

const getRandomDigit = (length = 6) => {
  const asciiStart = 48; // '0'
  const asciiEnd = 57;   // '9'
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomAscii = Math.floor(Math.random() * (asciiEnd - asciiStart + 1)) + asciiStart;
    result += String.fromCharCode(randomAscii);
  }

  return result;
}

function getRandomString(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

module.exports = {
  getRandomUppercaseLetter,
  getRandomLowercaseLetter,
  getRandomDigit,
  getRandomString,
}
