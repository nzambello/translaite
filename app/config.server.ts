import { countUsers } from "./models/user.server";

export const ALLOW_USER_SIGNUP = process.env.ALLOW_USER_SIGNUP === "1" || null;

export const isSignupAllowed = async () => {
  let isFirstUser = (await countUsers()) === 0;
  if (isFirstUser) {
    return true;
  }

  return !!ALLOW_USER_SIGNUP;
};
