/** Gera ADMIN_PASSWORD_HASH para o .env:  npm run admin:hash -- "minha senha forte" */
import { hashPassword } from './auth.mjs';

const pwd = process.argv[2];
if (!pwd || pwd.length < 10) {
  console.error('Uso: npm run admin:hash -- "senha com pelo menos 10 caracteres"');
  process.exit(1);
}
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(pwd)}`);
