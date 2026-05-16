const bcrypt = require('bcryptjs');

const pass = process.argv[2] || 'password';

(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pass, salt);
  console.log(hash);
})();

