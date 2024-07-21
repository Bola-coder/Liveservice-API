import * as bcrypt from 'bcryptjs';

export const encrypt = async (text: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(text, salt);
};

export const decrypt = async (text: string, encryptedText: string) => {
  return await bcrypt.compare(text, encryptedText);
};
