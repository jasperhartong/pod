import shortid from "shortid";

shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-$" // Don't use `_` so we can use `u_` as a prefix
);

export const generateUid = () => `u_${shortid.generate()}`;
