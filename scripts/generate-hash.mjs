import bcrypt from 'bcryptjs';

const password = process.argv[2] || '1616Dh!dofly';

try {
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
} catch (error) {
  console.error('Error generating hash:', error);
  process.exit(1);
}
