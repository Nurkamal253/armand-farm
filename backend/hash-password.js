const bcrypt = require("bcryptjs");

async function hashPassword() {

  const password = "Kisahkasih";

  const hashedPassword =
    await bcrypt.hash(

      password,

      10

    );

  console.log(hashedPassword);

}

hashPassword();