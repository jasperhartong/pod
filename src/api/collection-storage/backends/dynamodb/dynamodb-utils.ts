import shortid from "shortid";

shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-$" // Don't use `_` so we can use `U_` as a prefix
);

export const generateUid = () => `U_${shortid.generate()}`;
