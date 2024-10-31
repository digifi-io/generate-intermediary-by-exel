import { z } from 'zod';

const transformPhone = (phone?: string) => {
  if (!!phone?.length) {
    const transformedValue = phone
      .trim()
      .replace(/\s/gim, '')
      .replace(/\W/gim, '');

    return transformedValue.startsWith('+1')
      ? transformedValue
      : '+1' + transformedValue;
  }

  return phone;
};

const transformEmail = (email?: string) => (!email ? undefined : email);

export const phoneNumberSchema = z
  .string()
  .optional()
  .transform(transformPhone);

export const emailSchema = z
  .string()
  .optional()
  .transform(transformEmail)
  .or(z.string().email());
